import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getJobs, createJob, recommendJobs } from '../api/jobs';
import { getResumes } from '../api/resume';
import { Briefcase, Search, MapPin, Building, ExternalLink, Plus } from 'lucide-react';

export default function JobAggregator() {
  const { user } = useAuth();
  const [view, setView] = useState('find'); // find, post
  const [jobs, setJobs] = useState({ internal: [], external: [] });
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '', company: '', location: '', description: '', requirements: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resResume, resJobs] = await Promise.all([
          getResumes(),
          getJobs()
      ]);
      setResumes(resResume.data);
      // Initially show all internal jobs
      setJobs({ internal: resJobs.data, external: [] });
      if (resResume.data.length > 0) {
          setSelectedResume(resResume.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFindJobs = async () => {
      if (!selectedResume) {
          alert('Please select a resume first');
          return;
      }
      setLoading(true);
      try {
          const res = await recommendJobs(selectedResume);
          setJobs(res.data);
      } catch (err) {
          alert('Failed to find jobs');
      } finally {
          setLoading(false);
      }
  };

  const handlePostJob = async (e) => {
      e.preventDefault();
      try {
          await createJob({
              ...jobForm,
              requirements: jobForm.requirements.split(',').map(s => s.trim())
          });
          alert('Job posted successfully!');
          setJobForm({ title: '', company: '', location: '', description: '', requirements: '' });
          fetchInitialData(); // Refresh list
          setView('find');
      } catch (err) {
          alert('Failed to post job');
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded shadow-sm gap-4">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800">Job Aggregator</h1>
                <p className="text-gray-600 mt-1">Find jobs matched to your resume or post openings.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto justify-center flex-wrap">
                <button 
                    onClick={() => setView('find')}
                    className={`px-4 py-2 rounded font-medium ${view === 'find' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Find Jobs
                </button>
                {(user?.role === 'guide' || user?.role === 'admin') && (
                <button 
                    onClick={() => setView('post')}
                    className={`px-4 py-2 rounded font-medium ${view === 'post' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Post a Job
                </button>
                )}
            </div>
        </div>

        {/* Find Jobs View */}
        {view === 'find' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded shadow">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Resume</label>
                        <select 
                            className="w-full border p-2 rounded mb-4"
                            value={selectedResume}
                            onChange={(e) => setSelectedResume(e.target.value)}
                        >
                            <option value="">-- Select Resume --</option>
                            {resumes.map(r => (
                                <option key={r._id} value={r._id}>{r.title}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleFindJobs}
                            disabled={loading || !selectedResume}
                            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            <Search size={18} /> {loading ? 'Searching...' : 'Find Matches'}
                        </button>
                    </div>

                    {jobs.external.length > 0 && (
                        <div className="bg-white p-4 rounded shadow">
                            <h3 className="font-bold text-gray-800 mb-3">External Search</h3>
                            <p className="text-xs text-gray-500 mb-3">One-click search on major platforms based on your resume keywords.</p>
                            <div className="space-y-2">
                                {jobs.external.map((link, i) => (
                                    <a 
                                        key={i} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="block bg-gray-50 border hover:bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm flex justify-between items-center"
                                    >
                                        {link.source} <ExternalLink size={14} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Job List */}
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="font-bold text-xl text-gray-800">Job Listings ({jobs.internal.length})</h2>
                    {jobs.internal.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded shadow text-gray-500">
                            No jobs found. Try posting one!
                        </div>
                    ) : (
                        jobs.internal.map(job => (
                            <div key={job._id} className="bg-white p-6 rounded shadow hover:shadow-md transition border-l-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                            <span className="flex items-center gap-1"><Building size={14} /> {job.company}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                            <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="mt-3 text-gray-700 line-clamp-2">{job.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {job.requirements.map((req, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{req}</span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* Post Job View */}
        {view === 'post' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
                <h2 className="text-2xl font-bold mb-6">Post a New Job</h2>
                <form onSubmit={handlePostJob} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        <input required className="w-full border p-2 rounded" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company</label>
                            <input required className="w-full border p-2 rounded" value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input required className="w-full border p-2 rounded" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea required className="w-full border p-2 rounded h-32" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Requirements (comma separated)</label>
                        <input className="w-full border p-2 rounded" value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">
                        Post Job
                    </button>
                </form>
            </div>
        )}

      </div>
    </div>
  );
}
