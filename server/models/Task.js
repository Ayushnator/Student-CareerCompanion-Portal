import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['personal', 'global'],
      default: 'personal',
    },
    // For personal tasks, this is the owner.
    // For global tasks, this is the guide/admin who created it.
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // For personal tasks: true/false
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // For global tasks: list of users who have completed this task
    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Task', TaskSchema);
