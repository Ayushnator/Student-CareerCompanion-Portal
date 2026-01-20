import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Subject', SubjectSchema);

