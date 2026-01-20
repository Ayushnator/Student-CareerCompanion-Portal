import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API Key is missing');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: jobs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ status: 'success', data: job });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const recommendJobs = async (req, res) => {
    try {
        const { resumeId } = req.body;
        const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
        if (!resume) return res.status(404).json({ status: 'error', message: 'Resume not found' });

        // 1. Get Keywords (from Structured Data)
        let keywords = '';
        let skillsForSearch = [];

        // Use stored skills
        skillsForSearch = [
            ...(resume.skills?.technical || []),
            ...(resume.skills?.soft || []),
            ...(resume.skills?.tools || [])
        ];
        keywords = [
                resume.skills?.technical?.[0],
                resume.skills?.technical?.[1],
                resume.personalInfo?.title || 'Developer'
        ].filter(Boolean).join(' ');
        
        // 1. Search Internal Jobs
        // Simple regex search for now (MongoDB Text Search is better but needs setup)
        const searchString = skillsForSearch.join(' ') + ' ' + keywords;
        
        const internalJobs = await Job.find(
            { $text: { $search: searchString } },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(10);

        // 2. Generate External Search Links
        const query = encodeURIComponent(keywords.replace(/\n/g, ' ').trim());
        const location = encodeURIComponent(resume.personalInfo?.location || '');
        
        const externalSearches = [
            {
                source: 'LinkedIn',
                url: `https://www.linkedin.com/jobs/search/?keywords=${query}&location=${location}`
            },
            {
                source: 'Indeed',
                url: `https://www.indeed.com/jobs?q=${query}&l=${location}`
            },
            {
                source: 'Google Jobs',
                url: `https://www.google.com/search?q=${query}+jobs+in+${location}&ibp=htl;jobs`
            },
            {
                source: 'Unstop',
                url: `https://unstop.com/jobs?searchTerm=${query}`
            },
            {
                source: 'Naukri',
                url: `https://www.naukri.com/${query.replace(/ /g, '-')}-jobs-in-${location.replace(/ /g, '-')}`
            }
        ];

        res.status(200).json({
            status: 'success',
            data: {
                internal: internalJobs,
                external: externalSearches
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
