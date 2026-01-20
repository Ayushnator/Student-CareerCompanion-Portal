import Task from '../models/Task.js';

// Get all tasks for the logged-in user
// This includes:
// 1. Personal tasks created by the user
// 2. Global tasks (created by guides/admins)
export const getTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find personal tasks
    const personalTasks = await Task.find({
      creator: userId,
      type: 'personal',
    }).sort({ createdAt: -1 });

    // Find global tasks
    const globalTasks = await Task.find({
      type: 'global',
    }).sort({ createdAt: -1 });

    // Enhance global tasks with completion status for the current user
    const enhancedGlobalTasks = globalTasks.map((task) => {
      const isCompleted = task.completedBy.includes(userId);
      return {
        ...task.toObject(),
        isCompleted, // Override/Add isCompleted for the frontend
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        personal: personalTasks,
        global: enhancedGlobalTasks,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, type } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!title) {
      return res.status(400).json({ status: 'error', message: 'Title is required' });
    }

    // Only guides/admins can create global tasks
    if (type === 'global' && !['guide', 'admin'].includes(userRole)) {
      return res.status(403).json({ status: 'error', message: 'Only guides can create global tasks' });
    }

    const task = await Task.create({
      title,
      type: type || 'personal',
      creator: userId,
    });

    res.status(201).json({ status: 'success', data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// Toggle Task Completion
export const toggleTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: 'error', message: 'Task not found' });
    }

    if (task.type === 'personal') {
      if (task.creator.toString() !== userId.toString()) {
        return res.status(403).json({ status: 'error', message: 'Not authorized' });
      }
      task.isCompleted = !task.isCompleted;
    } else {
      // Global Task
      const index = task.completedBy.indexOf(userId);
      if (index === -1) {
        task.completedBy.push(userId);
      } else {
        task.completedBy.splice(index, 1);
      }
    }

    await task.save();

    // Return the updated task with correct context
    const responseTask = task.toObject();
    if (task.type === 'global') {
        responseTask.isCompleted = task.completedBy.includes(userId);
    }

    res.status(200).json({ status: 'success', data: responseTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: 'error', message: 'Task not found' });
    }

    // Only creator can delete
    if (task.creator.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    await task.deleteOne();
    res.status(200).json({ status: 'success', message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};
