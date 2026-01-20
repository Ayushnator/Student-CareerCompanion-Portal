import React, { useState, useEffect } from 'react';
import { request } from '../api/http';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Circle, Trash2, Plus, Calendar } from 'lucide-react';

const TaskScheduler = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({ personal: [], global: [] });
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'global'

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await request('/tasks');
      if (res.status === 'success') {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const type = activeTab === 'global' ? 'global' : 'personal';
      const res = await request('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTaskTitle, type }),
      });

      if (res.status === 'success') {
        setNewTaskTitle('');
        fetchTasks(); // Refresh list
      }
    } catch (err) {
      alert('Failed to create task: ' + err.message);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await request(`/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });

      if (res.status === 'success') {
        // Optimistic update or refetch
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await request(`/tasks/${taskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task: ' + err.message);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading tasks...</div>;

  const currentList = activeTab === 'personal' ? tasks.personal : tasks.global;

  return (
    <div className="bg-white rounded shadow p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Task Scheduler
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4">
        <button
          className={`pb-2 px-1 ${
            activeTab === 'personal'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('personal')}
        >
          My Tasks
        </button>
        <button
          className={`pb-2 px-1 ${
            activeTab === 'global'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('global')}
        >
          Guide Tasks
        </button>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleCreateTask} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={
              activeTab === 'global' && user.role === 'basic'
                ? 'Only guides can add global tasks'
                : 'Add a new task...'
            }
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={activeTab === 'global' && !['guide', 'admin'].includes(user.role)}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={
              !newTaskTitle.trim() ||
              (activeTab === 'global' && !['guide', 'admin'].includes(user.role))
            }
            className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Only show "Post to All Students" checkbox if user is guide/admin AND on Global tab (or allowed to switch context) */}
        {/* Actually, user might want to add a global task while on Personal tab? 
            Let's keep it simple: Add task adds to the *current active tab* list context mostly. 
            But logically, if I am on "My Tasks", I add a personal task. 
            If I am on "Guide Tasks" (and I am a guide), I add a global task. 
        */}
        {activeTab === 'global' && ['guide', 'admin'].includes(user.role) && (
            <div className="mt-1 text-xs text-gray-500">
                This task will appear for all students.
            </div>
        )}
        
        {/* Logic: if activeTab is global, we set isGlobal=true automatically in handleCreateTask logic? 
            Let's update handleCreateTask to use activeTab to decide type.
        */}
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
        {currentList.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No tasks found.</p>
        )}
        {currentList.map((task) => (
          <div
            key={task._id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded group hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => handleToggleTask(task._id)}
                className={`text-gray-400 hover:text-green-600 transition-colors ${
                  task.isCompleted ? 'text-green-600' : ''
                }`}
              >
                {task.isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <span
                className={`text-sm ${
                  task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
                }`}
              >
                {task.title}
              </span>
            </div>

            {/* Delete Button: Only for Creator or Admin */}
            {(task.creator === user._id || user.role === 'admin') && (
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Fix the isGlobal logic in handleCreateTask before saving
// I'll assume I update the handleCreateTask above to use activeTab
// Let's rewrite the component content properly in the tool call.

export default TaskScheduler;
