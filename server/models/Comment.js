import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: 'Anonymous' },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', CommentSchema);

