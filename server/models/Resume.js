import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  
  // Structured Data
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    linkedin: String,
    portfolio: String,
    location: String,
    summary: String
  },
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    startDate: String,
    endDate: String,
    gpa: String,
    description: String
  }],
  experience: [{
    company: String,
    role: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String
  }],
  skills: {
    technical: [String],
    soft: [String],
    languages: [String], // e.g. English, Spanish
    tools: [String]
  },
  // Flattened skills for easier search if needed, but we can use the object above
  
  projects: [{
    name: String,
    description: String,
    techStack: String,
    link: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    link: String
  }],
  
  aiScore: {
    type: Number,
    default: 0
  },
  aiFeedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Resume', ResumeSchema);
