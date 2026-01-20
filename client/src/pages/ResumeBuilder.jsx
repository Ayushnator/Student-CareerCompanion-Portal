import React, { useState, useEffect } from 'react';
import { getResumes, createResume, updateResume, deleteResume, analyzeResume, getResume } from '../api/resume';
import { FileText, Download, Trash2, Edit, PieChart, Plus } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function ResumeBuilder() {
  const [view, setView] = useState('list'); // list, edit, analyze, preview
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState(getInitialState());

  function getInitialState() {
    return {
      title: 'My Resume',
      personalInfo: { fullName: '', email: '', phone: '', linkedin: '', portfolio: '', location: '', summary: '' },
      skills: { technical: [], soft: [], languages: [], tools: [] },
      experience: [],
      education: [],
      projects: [],
      certifications: []
    };
  }

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await getResumes();
      setResumes(res.data);
    } catch (err) {
      setError('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    if (resumes.length >= 5) {
      alert('Maximum limit of 5 resumes reached.');
      return;
    }
    setFormData(getInitialState());
    setCurrentResume(null);
    setView('edit');
  };

  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const res = await getResume(id);
      setCurrentResume(res.data);
      
      // Merge with initial state to ensure all fields exist
      const mergedData = { ...getInitialState(), ...res.data };
      // Ensure skills is object not array (migration)
      if (Array.isArray(mergedData.skills)) {
          mergedData.skills = { technical: mergedData.skills, soft: [], languages: [], tools: [] };
      }
      
      setFormData(mergedData);
      setView('edit');
    } catch (err) {
      setError('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await deleteResume(id);
      fetchResumes();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleAnalyze = async (id) => {
    setLoading(true);
    try {
      const res = await analyzeResume(id);
      setCurrentResume(res.data);
      setView('analyze');
    } catch (err) {
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Basic Validation
      if (!formData.personalInfo.fullName) {
          alert('Full Name is required');
          return;
      }

      if (currentResume) {
        await updateResume(currentResume._id, formData);
      } else {
        await createResume(formData);
      }
      fetchResumes();
      setView('list');
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };

  const handleDownloadPDF = () => {
      const element = document.getElementById('resume-preview');
      const opt = {
        margin:       0.5,
        filename:     `${formData.personalInfo.fullName || 'Resume'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
  };

  // --- Render Helpers ---

  const updateInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateSkills = (category, value) => {
      setFormData(prev => ({
          ...prev,
          skills: { ...prev.skills, [category]: value.split(',').map(s => s.trim()) }
      }));
  };

  // Render List
  const renderList = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">My Resumes</h1>
            <p className="text-gray-600 mt-1">Manage and optimize your professional profiles (Max 5)</p>
        </div>
        <div className="flex gap-3 flex-wrap">
            <button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
            >
                <Plus size={18} /> Create New
            </button>
        </div>
      </div>

      {loading && <div className="text-center py-10">Loading...</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map(resume => (
          <div key={resume._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FileText size={24} />
                </div>
                {resume.aiScore > 0 && (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${resume.aiScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        Score: {resume.aiScore}
                    </span>
                )}
            </div>
            
            <h3 className="font-bold text-xl text-gray-800 mb-1 truncate">{resume.title || 'Untitled Resume'}</h3>
            <p className="text-sm text-gray-500 mb-4">Updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
            
            <div className="flex justify-between border-t pt-4">
              <button onClick={() => handleEdit(resume._id)} className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm">
                  <Edit size={16} /> Edit
              </button>
              <button onClick={() => handleAnalyze(resume._id)} className="flex items-center gap-1 text-gray-600 hover:text-purple-600 text-sm">
                  <PieChart size={16} /> Analyze
              </button>
              <button onClick={() => handleDelete(resume._id)} className="flex items-center gap-1 text-gray-600 hover:text-red-600 text-sm">
                  <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && resumes.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No resumes found. Create one to get started.</p>
                <button onClick={handleCreateNew} className="text-blue-600 hover:underline">Get Started</button>
            </div>
        )}
      </div>
    </div>
  );

  // Render Editor
  const [showPreview, setShowPreview] = useState(false);

  const renderEditor = () => (
    <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">
      {/* Mobile Toggle */}
      <div className="lg:hidden flex justify-end">
          <button 
            onClick={() => setShowPreview(!showPreview)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium"
          >
            {showPreview ? 'Show Editor' : 'Show Preview'}
          </button>
      </div>

      {/* Left: Form */}
      <div className={`w-full lg:w-1/2 bg-white rounded shadow flex flex-col overflow-hidden ${showPreview ? 'hidden lg:flex' : 'flex'}`}>
         <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-lg">Editor</h2>
            <div className="flex gap-2">
                <button onClick={() => setView('list')} className="text-gray-600 text-sm hover:underline">Close</button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <section>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Resume Title</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </section>

            <section>
                <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">Personal Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Full Name" className="border p-2 rounded" value={formData.personalInfo.fullName} onChange={e => updateInfo('fullName', e.target.value)} />
                    <input placeholder="Email" className="border p-2 rounded" value={formData.personalInfo.email} onChange={e => updateInfo('email', e.target.value)} />
                    <input placeholder="Phone" className="border p-2 rounded" value={formData.personalInfo.phone} onChange={e => updateInfo('phone', e.target.value)} />
                    <input placeholder="Location (City, Country)" className="border p-2 rounded" value={formData.personalInfo.location} onChange={e => updateInfo('location', e.target.value)} />
                    <input placeholder="LinkedIn URL" className="border p-2 rounded" value={formData.personalInfo.linkedin} onChange={e => updateInfo('linkedin', e.target.value)} />
                    <input placeholder="Portfolio URL" className="border p-2 rounded" value={formData.personalInfo.portfolio} onChange={e => updateInfo('portfolio', e.target.value)} />
                </div>
                <textarea placeholder="Professional Summary" className="w-full border p-2 rounded mt-3 h-24" value={formData.personalInfo.summary} onChange={e => updateInfo('summary', e.target.value)}></textarea>
            </section>

            <section>
                <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">Experience</h3>
                {formData.experience.map((exp, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded mb-3 border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <input placeholder="Company" className="border p-1 rounded" value={exp.company} onChange={e => {
                                const newExp = [...formData.experience]; newExp[idx].company = e.target.value; setFormData({...formData, experience: newExp});
                            }} />
                            <input placeholder="Role" className="border p-1 rounded" value={exp.role} onChange={e => {
                                const newExp = [...formData.experience]; newExp[idx].role = e.target.value; setFormData({...formData, experience: newExp});
                            }} />
                             <input placeholder="Start Date" className="border p-1 rounded" value={exp.startDate} onChange={e => {
                                const newExp = [...formData.experience]; newExp[idx].startDate = e.target.value; setFormData({...formData, experience: newExp});
                            }} />
                             <input placeholder="End Date" className="border p-1 rounded" value={exp.endDate} onChange={e => {
                                const newExp = [...formData.experience]; newExp[idx].endDate = e.target.value; setFormData({...formData, experience: newExp});
                            }} />
                        </div>
                        <textarea placeholder="Description (Bullet points recommended)" className="w-full border p-1 rounded h-20 text-sm" value={exp.description} onChange={e => {
                            const newExp = [...formData.experience]; newExp[idx].description = e.target.value; setFormData({...formData, experience: newExp});
                        }} />
                         <button onClick={() => setFormData({...formData, experience: formData.experience.filter((_, i) => i !== idx)})} className="text-red-500 text-xs mt-1">Remove</button>
                    </div>
                ))}
                <button onClick={() => setFormData({...formData, experience: [...formData.experience, { company: '', role: '', startDate: '', endDate: '', description: '' }]})} className="text-blue-600 text-sm">+ Add Experience</button>
            </section>

            <section>
                <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">Education</h3>
                {formData.education.map((edu, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded mb-3 border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <input placeholder="School" className="border p-1 rounded" value={edu.school} onChange={e => {
                                const newEdu = [...formData.education]; newEdu[idx].school = e.target.value; setFormData({...formData, education: newEdu});
                            }} />
                            <input placeholder="Degree" className="border p-1 rounded" value={edu.degree} onChange={e => {
                                const newEdu = [...formData.education]; newEdu[idx].degree = e.target.value; setFormData({...formData, education: newEdu});
                            }} />
                            <input placeholder="Year/Date" className="border p-1 rounded" value={edu.startDate} onChange={e => {
                                const newEdu = [...formData.education]; newEdu[idx].startDate = e.target.value; setFormData({...formData, education: newEdu});
                            }} />
                        </div>
                         <button onClick={() => setFormData({...formData, education: formData.education.filter((_, i) => i !== idx)})} className="text-red-500 text-xs mt-1">Remove</button>
                    </div>
                ))}
                <button onClick={() => setFormData({...formData, education: [...formData.education, { school: '', degree: '', startDate: '' }]})} className="text-blue-600 text-sm">+ Add Education</button>
            </section>

            <section>
                <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">Projects</h3>
                {formData.projects.map((proj, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded mb-3 border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <input placeholder="Project Name" className="border p-1 rounded" value={proj.name} onChange={e => {
                                const newProj = [...formData.projects]; newProj[idx].name = e.target.value; setFormData({...formData, projects: newProj});
                            }} />
                            <input placeholder="Tech Stack" className="border p-1 rounded" value={proj.techStack} onChange={e => {
                                const newProj = [...formData.projects]; newProj[idx].techStack = e.target.value; setFormData({...formData, projects: newProj});
                            }} />
                             <input placeholder="Link" className="border p-1 rounded col-span-2" value={proj.link} onChange={e => {
                                const newProj = [...formData.projects]; newProj[idx].link = e.target.value; setFormData({...formData, projects: newProj});
                            }} />
                        </div>
                        <textarea placeholder="Description" className="w-full border p-1 rounded h-20 text-sm" value={proj.description} onChange={e => {
                            const newProj = [...formData.projects]; newProj[idx].description = e.target.value; setFormData({...formData, projects: newProj});
                        }} />
                         <button onClick={() => setFormData({...formData, projects: formData.projects.filter((_, i) => i !== idx)})} className="text-red-500 text-xs mt-1">Remove</button>
                    </div>
                ))}
                <button onClick={() => setFormData({...formData, projects: [...formData.projects, { name: '', description: '', techStack: '', link: '' }]})} className="text-blue-600 text-sm">+ Add Project</button>
            </section>

            <section>
                <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">Certifications</h3>
                {formData.certifications.map((cert, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded mb-3 border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <input placeholder="Name" className="border p-1 rounded" value={cert.name} onChange={e => {
                                const newCert = [...formData.certifications]; newCert[idx].name = e.target.value; setFormData({...formData, certifications: newCert});
                            }} />
                            <input placeholder="Issuer" className="border p-1 rounded" value={cert.issuer} onChange={e => {
                                const newCert = [...formData.certifications]; newCert[idx].issuer = e.target.value; setFormData({...formData, certifications: newCert});
                            }} />
                             <input placeholder="Date" className="border p-1 rounded" value={cert.date} onChange={e => {
                                const newCert = [...formData.certifications]; newCert[idx].date = e.target.value; setFormData({...formData, certifications: newCert});
                            }} />
                             <input placeholder="Link" className="border p-1 rounded" value={cert.link} onChange={e => {
                                const newCert = [...formData.certifications]; newCert[idx].link = e.target.value; setFormData({...formData, certifications: newCert});
                            }} />
                        </div>
                         <button onClick={() => setFormData({...formData, certifications: formData.certifications.filter((_, i) => i !== idx)})} className="text-red-500 text-xs mt-1">Remove</button>
                    </div>
                ))}
                <button onClick={() => setFormData({...formData, certifications: [...formData.certifications, { name: '', issuer: '', date: '' }]})} className="text-blue-600 text-sm">+ Add Certification</button>
            </section>

             <section>
                <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">Skills</h3>
                <div className="space-y-2">
                    <div>
                        <label className="text-xs text-gray-500">Technical Skills (comma separated)</label>
                        <input className="w-full border p-2 rounded" value={formData.skills.technical?.join(', ')} onChange={e => updateSkills('technical', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Soft Skills (comma separated)</label>
                        <input className="w-full border p-2 rounded" value={formData.skills.soft?.join(', ')} onChange={e => updateSkills('soft', e.target.value)} />
                    </div>
                     <div>
                        <label className="text-xs text-gray-500">Languages (comma separated)</label>
                        <input className="w-full border p-2 rounded" value={formData.skills.languages?.join(', ')} onChange={e => updateSkills('languages', e.target.value)} />
                    </div>
                </div>
            </section>
         </div>
      </div>

      {/* Right: Live Preview */}
      <div className={`w-full lg:w-1/2 bg-gray-200 rounded shadow flex flex-col ${!showPreview ? 'hidden lg:flex' : 'flex'}`}>
         <div className="p-4 border-b flex justify-between items-center bg-white rounded-t">
            <h2 className="font-bold text-lg">Preview</h2>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                <Download size={16} /> Download PDF
            </button>
         </div>
         <div className="flex-1 bg-gray-500 p-8 overflow-y-auto flex justify-center">
            <div id="resume-preview" className="bg-white shadow-lg p-8 mx-auto" style={{ width: '210mm', minHeight: '297mm', height: 'auto' }}>
                <div className="border-b-2 border-gray-800 pb-4 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wider">{formData.personalInfo.fullName}</h1>
                    <div className="flex flex-wrap gap-3 text-gray-600 mt-2 text-xs">
                        {formData.personalInfo.email && <span>{formData.personalInfo.email}</span>}
                        {formData.personalInfo.phone && <span>• {formData.personalInfo.phone}</span>}
                        {formData.personalInfo.location && <span>• {formData.personalInfo.location}</span>}
                        {formData.personalInfo.linkedin && <span>• {formData.personalInfo.linkedin}</span>}
                        {formData.personalInfo.portfolio && <span>• {formData.personalInfo.portfolio}</span>}
                    </div>
                </div>

                {formData.personalInfo.summary && (
                    <section className="mb-6">
                        <h2 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 mb-2">Professional Summary</h2>
                        <p className="text-gray-700">{formData.personalInfo.summary}</p>
                    </section>
                )}

                {formData.skills && (formData.skills.technical?.length > 0 || formData.skills.soft?.length > 0) && (
                     <section className="mb-6">
                        <h2 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 mb-2">Skills</h2>
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                             {formData.skills.technical?.length > 0 && (
                                <>
                                    <span className="font-semibold">Technical:</span>
                                    <span>{formData.skills.technical.join(', ')}</span>
                                </>
                             )}
                             {formData.skills.soft?.length > 0 && (
                                <>
                                    <span className="font-semibold">Soft Skills:</span>
                                    <span>{formData.skills.soft.join(', ')}</span>
                                </>
                             )}
                              {formData.skills.languages?.length > 0 && (
                                <>
                                    <span className="font-semibold">Languages:</span>
                                    <span>{formData.skills.languages.join(', ')}</span>
                                </>
                             )}
                        </div>
                    </section>
                )}

                {formData.experience.length > 0 && (
                    <section className="mb-6">
                        <h2 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 mb-3">Experience</h2>
                        <div className="space-y-4">
                            {formData.experience.map((exp, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-gray-900">{exp.role}</h3>
                                        <span className="text-gray-600 text-xs">{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}</span>
                                    </div>
                                    <div className="text-gray-700 font-medium italic mb-1">{exp.company}</div>
                                    <p className="whitespace-pre-wrap text-gray-700">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                 {formData.education.length > 0 && (
                    <section className="mb-6">
                        <h2 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 mb-3">Education</h2>
                        <div className="space-y-3">
                            {formData.education.map((edu, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-gray-900">{edu.school}</h3>
                                        <span className="text-gray-600 text-xs">{edu.startDate}</span>
                                    </div>
                                    <div className="text-gray-700">{edu.degree}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
         </div>
      </div>
    </div>
  );

  const renderAnalyze = () => (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-8">
        <div className="flex justify-between mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold">AI Resume Analysis</h2>
            <button onClick={() => setView('list')} className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">Back to List</button>
        </div>

        {currentResume && (
            <div className="space-y-8">
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl border">
                    <div className={`text-6xl font-bold ${currentResume.aiScore >= 80 ? 'text-green-600' : currentResume.aiScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {currentResume.aiScore}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Resume Score</h3>
                        <p className="text-gray-600">Based on content completeness, ATS compatibility, and impact.</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Detailed Feedback</h3>
                    <div className="prose max-w-none p-6 bg-white border rounded-lg shadow-sm whitespace-pre-wrap text-gray-700">
                        {currentResume.aiFeedback}
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderFileView = () => {
      return (
          <div className="max-w-6xl mx-auto p-6 flex flex-col h-[calc(100vh-80px)]">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{currentResume.title}</h2>
                  <button onClick={() => setView('list')} className="text-blue-600 hover:underline">Back to List</button>
              </div>
              <div className="flex-1 bg-white rounded border overflow-auto p-8 shadow-inner">
                  {fileUrl ? (
                      <div dangerouslySetInnerHTML={{ __html: fileUrl }} className="prose max-w-none" />
                  ) : (
                      <div className="flex items-center justify-center h-full">
                        <p>Loading content...</p>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {view === 'list' && renderList()}
      {view === 'edit' && renderEditor()}
      {view === 'analyze' && renderAnalyze()}
      {view === 'viewFile' && renderFileView()}
    </div>
  );
}
