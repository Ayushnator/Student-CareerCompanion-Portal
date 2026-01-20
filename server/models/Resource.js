import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['pdf', 'link'], required: true },
    url: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Resource', ResourceSchema);

