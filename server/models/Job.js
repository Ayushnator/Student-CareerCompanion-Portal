import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  externalLink: {
    type: String
  },
  salaryRange: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'expired'],
    default: 'active'
  }
}, { timestamps: true });

// Index for search
JobSchema.index({ title: 'text', description: 'text', company: 'text', 'requirements': 'text' });

export default mongoose.model('Job', JobSchema);
