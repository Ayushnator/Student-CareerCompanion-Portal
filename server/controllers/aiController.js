import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatSession from '../models/ChatSession.js';

// Initialize Gemini Client
const getGeminiModel = (systemInstruction) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API Key is missing');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: systemInstruction
  });
};

const getSystemPrompt = (type, context) => {
  if (type === 'interviewer') {
    return `You are a professional technical interviewer for a ${context || 'General'} role. 
    Conduct a mock interview. Ask one question at a time. 
    Wait for the user's answer, then evaluate it briefly and ask the next question. 
    Be professional but encouraging. Do not provide long explanations unless asked. 
    Start by introducing yourself and asking the first question.`;
  } else if (type === 'resume') {
    return `You are an expert Resume Analyzer and Career Coach. 
    Analyze the resume provided by the user. 
    Provide a score out of 100 based on ATS friendliness, impact, and clarity. 
    List specific improvements. Be constructive.`;
  } else {
    // default 'mentor'
    return 'You are a helpful, encouraging, and knowledgeable academic AI mentor named "Nexus AI". Your goal is to help students with their studies, career advice, and learning resources. Be concise, professional, yet friendly.';
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, type = 'mentor', context } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Message is required' });
    }

    // 1. Get or create chat session for this type
    let session = await ChatSession.findOne({ user: userId, type });
    
    // Determine system prompt
    // If session exists, we use the existing system prompt from the first message (or default if missing)
    // If new session, we generate one.
    let systemPrompt = getSystemPrompt(type, context);

    if (!session) {
      session = await ChatSession.create({
        user: userId,
        type,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
        ],
      });
    } else {
        // If it's an existing session, try to retrieve the system prompt from history to maintain consistency
        const sysMsg = session.messages.find(m => m.role === 'system');
        if (sysMsg) {
            systemPrompt = sysMsg.content;
        }
    }

    // 2. Add user message to DB
    session.messages.push({ role: 'user', content: message });

    // 3. Call Gemini API
    let aiResponseContent = "I'm sorry, I can't connect to my brain right now. Please check the server configuration (API Key).";
    
    try {
      // Initialize model with system instruction
      const model = getGeminiModel(systemPrompt);
      
      // Convert DB messages to Gemini history format
      const history = session.messages
        .filter(msg => msg.role !== 'system') 
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

      // Remove the last message (current user message)
      const historyForChat = history.slice(0, -1); 

      const chat = model.startChat({
        history: historyForChat,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      aiResponseContent = response.text();

    } catch (apiError) {
      console.error('Gemini API Error:', apiError);

      if (apiError.message.includes('API key not valid') || apiError.message.includes('API_KEY_INVALID')) {
         aiResponseContent = "⚠️ **Authentication Failed**: The provided Gemini API Key is invalid. Please check your .env file.";
      } else if (apiError.message.includes('Missing')) {
         aiResponseContent = "⚠️ **Setup Required**: Please add your Gemini API Key to the .env file to enable my intelligence!";
      } else {
         aiResponseContent = "⚠️ **Connection Error**: I'm having trouble connecting to the AI service right now. (" + apiError.message + ")";
      }
    }

    // 4. Add assistant message to DB
    session.messages.push({ role: 'assistant', content: aiResponseContent });
    await session.save();

    return res.status(200).json({
      status: 'success',
      data: {
        response: aiResponseContent,
        history: session.messages,
      },
    });

  } catch (error) {
    console.error('Chat Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'mentor' } = req.query; // Get type from query params
    
    const session = await ChatSession.findOne({ user: userId, type });

    return res.status(200).json({
      status: 'success',
      data: {
        history: session ? session.messages : [],
      },
    });
  } catch (error) {
    console.error('Get History Error:', error);
    return res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'mentor' } = req.query; // Get type from query params or body

    // If type is interviewer and we want to clear to start new interview with new context, 
    // we just delete the session. Next sendMessage will recreate it.
    await ChatSession.findOneAndDelete({ user: userId, type });
    
    return res.status(200).json({
      status: 'success',
      message: 'Chat history cleared',
    });
  } catch (error) {
    console.error('Clear History Error:', error);
    return res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};
