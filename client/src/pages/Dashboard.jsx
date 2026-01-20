import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { requestGuideRole } from '../api/auth';
import { useState } from 'react';
import TaskScheduler from '../components/TaskScheduler';

export default function Dashboard() {
  const { user, loading, refreshMe } = useAuth();
  const [reqLoading, setReqLoading] = useState(false);

  const handleRequestGuide = async () => {
    if (!window.confirm('Request to become a Guide? Admins will review your request.')) return;
    setReqLoading(true);
    try {
        await requestGuideRole();
        await refreshMe();
        alert('Request sent successfully!');
    } catch (err) {
        alert('Failed to send request');
    } finally {
        setReqLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800">Student Nexus</h1>
      <p className="text-gray-600 mt-2">Career & Learning Ecosystem</p>

      {!user && (
        <div className="mt-8 bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800">Get started</h2>
          <p className="text-gray-600 mt-2">
            Create an account to access modules like Academic Hub, AI Mentor, Interview Assistant, and more.
          </p>
          <div className="flex gap-3 mt-4">
            <Link className="bg-gray-100 text-gray-800 px-4 py-2 rounded" to="/login">
              Login
            </Link>
          </div>
        </div>
      )}

      {user && (
        <div className="mt-8">
          <div className="bg-white rounded shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Welcome back, {user.name}</h2>
                    <p className="text-gray-600 mt-1 break-all">{user.email}</p>
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                        Role: {user.role}
                    </div>
                </div>
                
                {user.role === 'basic' && (
                    <div className="w-full md:w-auto md:text-right">
                        {user.guideRequestStatus === 'pending' ? (
                            <span className="text-yellow-600 font-medium">Guide Request Pending</span>
                        ) : (
                            <button 
                                onClick={handleRequestGuide}
                                disabled={reqLoading}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {reqLoading ? 'Sending...' : 'Request Guide Access'}
                            </button>
                        )}
                        <p className="text-xs text-gray-500 mt-1 max-w-xs ml-auto">
                            Guides can create subjects, post jobs, and upload resources.
                        </p>
                    </div>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded shadow p-6 text-white">
                <h3 className="text-lg font-semibold">Quick Stats</h3>
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                        <span>Resumes</span>
                        <span className="font-bold">5/5</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Interviews</span>
                        <span className="font-bold">--</span>
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 row-span-2">
               <TaskScheduler />
            </div>

            <div className="bg-white rounded shadow p-6 md:col-span-3">
                <h3 className="text-lg font-semibold text-gray-800">Recommended Actions</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/jobs" className="block p-4 border rounded hover:bg-gray-50 transition">
                        <div className="font-medium text-blue-600">Find Jobs</div>
                        <p className="text-sm text-gray-500">Explore new opportunities based on your skills.</p>
                    </Link>
                    <Link to="/interview" className="block p-4 border rounded hover:bg-gray-50 transition">
                        <div className="font-medium text-green-600">Practice Interview</div>
                        <p className="text-sm text-gray-500">Prepare for your next big role with AI.</p>
                    </Link>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

