import React, { useEffect, useState } from 'react';
import { request } from '../api/http';
import { Check, X, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState({});

  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await request('/admin/requests');
      console.log('Admin requests response:', res);
      if (res.status === 'success') {
        setRequests(res.data);
      } else {
        setError('Failed to load requests: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
      setError('Error fetching requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleApprove = async (userId) => {
    try {
      const role = selectedRoles[userId] || 'guide';
      await request(`/admin/approve/${userId}`, { 
        method: 'POST',
        body: JSON.stringify({ role }),
        headers: { 'Content-Type': 'application/json' }
      });
      fetchRequests();
      alert(`User approved as ${role}`);
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Reject this request?')) return;
    try {
      await request(`/admin/reject/${userId}`, { method: 'POST' });
      fetchRequests();
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading admin data...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="bg-white rounded shadow p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Pending Guide Requests
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button onClick={fetchRequests} className="underline text-sm mt-1">Try Again</button>
          </div>
        )}

        {requests.length === 0 && !error ? (
          <div className="text-center py-8">
             <p className="text-gray-500 mb-2">No pending requests found.</p>
             <button onClick={fetchRequests} className="text-indigo-600 hover:underline text-sm">Refresh List</button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 border-b font-medium text-gray-600">Name</th>
                    <th className="p-3 border-b font-medium text-gray-600">Email</th>
                    <th className="p-3 border-b font-medium text-gray-600">Date Requested</th>
                    <th className="p-3 border-b font-medium text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{req.name}</td>
                      <td className="p-3 border-b">{req.email}</td>
                      <td className="p-3 border-b">
                        {new Date(req.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 border-b text-right flex items-center justify-end gap-2">
                        <select
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500"
                          value={selectedRoles[req._id] || 'guide'}
                          onChange={(e) => handleRoleChange(req._id, e.target.value)}
                        >
                          <option value="guide">Guide</option>
                          <option value="admin">Admin</option>
                        </select>
                        
                        <button
                          onClick={() => handleApprove(req._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 inline-flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                          <Check className="w-4 h-4" /> Grant
                        </button>
                        
                        <button
                          onClick={() => handleReject(req._id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 inline-flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="bg-gray-50 border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{req.name}</h3>
                      <p className="text-sm text-gray-600">{req.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(req.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Role:</label>
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                        value={selectedRoles[req._id] || 'guide'}
                        onChange={(e) => handleRoleChange(req._id, e.target.value)}
                      >
                        <option value="guide">Guide</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req._id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 inline-flex items-center justify-center gap-1 text-sm font-medium"
                      >
                        <Check className="w-4 h-4" /> Grant Access
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 inline-flex items-center justify-center gap-1 text-sm font-medium"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
