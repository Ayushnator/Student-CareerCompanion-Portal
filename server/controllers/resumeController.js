import Resume from '../models/Resume.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API Key is missing');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

export const createResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Resume.countDocuments({ user: userId });
    
    if (count >= 5) {
      return res.status(400).json({ status: 'error', message: 'Resume limit reached (Max 5).' });
    }

    const resume = await Resume.create({ ...req.body, user: userId });
    res.status(201).json({ status: 'success', data: resume });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({ status: 'success', data: resumes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ status: 'error', message: 'Resume not found' });
    res.status(200).json({ status: 'success', data: resume });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ status: 'success', message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateResume = async (req, res) => {
    try {
        const resume = await Resume.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!resume) return res.status(404).json({ status: 'error', message: 'Resume not found' });
        res.status(200).json({ status: 'success', data: resume });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ status: 'error', message: 'Resume not found' });

    let resumeContent = `
      Resume Data:
      Name: ${resume.personalInfo?.fullName}
      Summary: ${resume.personalInfo?.summary}
      Skills: ${JSON.stringify(resume.skills)}
      Experience: ${resume.experience?.map(e => `${e.role} at ${e.company}: ${e.description}`).join('\n')}
      Education: ${resume.education?.map(e => `${e.degree} from ${e.school}`).join('\n')}
      Projects: ${resume.projects?.map(p => `${p.name}: ${p.description}`).join('\n')}
    `;

    // Construct prompt
    const prompt = `
      Act as an expert Resume Analyzer. Analyze the following resume content and provide:
      1. A score out of 100 (just the number).
      2. Detailed feedback on strengths and weaknesses.
      3. Specific suggestions for improvement.
      
      ${resumeContent}

      Format the response as JSON: { "score": number, "feedback": "string" }
    `;

    try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Basic cleanup if AI adds markdown code blocks
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(jsonStr);

        resume.aiScore = analysis.score || 0;
        resume.aiFeedback = analysis.feedback || text;
        await resume.save();

        res.status(200).json({ status: 'success', data: resume });
    } catch (aiError) {
        console.error("AI Error", aiError);
        res.status(500).json({ status: 'error', message: 'AI Analysis failed: ' + aiError.message });
    }

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
