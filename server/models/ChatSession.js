import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // Removed unique: true to allow multiple sessions (one per type)
    },
    type: {
      type: String,
      enum: ['mentor', 'interviewer', 'resume'],
      default: 'mentor',
      required: true
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one session per type per user
ChatSessionSchema.index({ user: 1, type: 1 }, { unique: true });

export default mongoose.model('ChatSession', ChatSessionSchema);
