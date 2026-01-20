import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubjects, createSubject } from '../api/subjects';
import { getResources, createResource, deleteResource } from '../api/resources';
import { getPosts, createPost, addComment, listComments, deletePost, deleteComment } from '../api/posts';

function AcademicHub() {
  const { user } = useAuth();
  const isGuideOrAdmin = user?.role === 'guide' || user?.role === 'admin';
  
  const [subjects, setSubjects] = useState([]);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [errorSubjects, setErrorSubjects] = useState('');

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [errorResources, setErrorResources] = useState('');

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState('');

  const [commentsMap, setCommentsMap] = useState({});

  const selectedSubject = useMemo(() => subjects.find(s => s._id === selectedSubjectId), [subjects, selectedSubjectId]);

  async function loadSubjects() {
    setLoadingSubjects(true);
    setErrorSubjects('');
    try {
      const res = await getSubjects(subjectQuery);
      setSubjects(res.data);
      if (!selectedSubjectId && res.data.length > 0) setSelectedSubjectId(res.data[0]._id);
    } catch (e) {
      setErrorSubjects(e.message);
    } finally {
      setLoadingSubjects(false);
    }
  }

  async function loadResources() {
    if (!selectedSubjectId) { setResources([]); return; }
    setLoadingResources(true);
    setErrorResources('');
    try {
      const res = await getResources({ subjectId: selectedSubjectId });
      setResources(res.data);
    } catch (e) {
      setErrorResources(e.message);
    } finally {
      setLoadingResources(false);
    }
  }

  async function loadPosts() {
    if (!selectedSubjectId) { setPosts([]); return; }
    setLoadingPosts(true);
    setErrorPosts('');
    try {
      const res = await getPosts({ subjectId: selectedSubjectId });
      setPosts(res.data);
    } catch (e) {
      setErrorPosts(e.message);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function loadComments(postId) {
    try {
      const res = await listComments(postId);
      setCommentsMap(prev => ({ ...prev, [postId]: res.data }));
    } catch (e) {
      setCommentsMap(prev => ({ ...prev, [postId]: [] }));
    }
  }

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => { loadResources(); loadPosts(); }, [selectedSubjectId]);

  async function handleCreateSubject(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.name.value.trim();
    const description = form.description.value.trim();
    const tags = form.tags.value.trim() ? form.tags.value.trim().split(',').map(t => t.trim()) : [];
    if (!name) return;
    try {
      await createSubject({ name, description, tags });
      form.reset();
      await loadSubjects();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleCreateResource(e) {
    e.preventDefault();
    if (!selectedSubjectId) return;
    const form = e.currentTarget;
    const title = form.title.value.trim();
    const type = form.type.value;
    const url = form.url.value.trim();
    const description = form.description.value.trim();
    if (!title || !url) return;
    try {
      await createResource({ subjectId: selectedSubjectId, title, type, url, description });
      form.reset();
      await loadResources();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDeleteResource(id) {
    try {
      await deleteResource(id);
      await loadResources();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!selectedSubjectId) return;
    const form = e.currentTarget;
    const title = form.title.value.trim();
    const content = form.content.value.trim();
    const authorName = form.authorName.value.trim() || 'Anonymous';
    if (!title || !content) return;
    try {
      await createPost({ title, content, subjectId: selectedSubjectId, authorName });
      form.reset();
      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDeletePost(id) {
    try {
      await deletePost(id);
      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleAddComment(e, postId) {
    e.preventDefault();
    const form = e.currentTarget;
    const content = form.content.value.trim();
    const authorName = form.authorName.value.trim() || 'Anonymous';
    if (!content) return;
    try {
      await addComment(postId, { content, authorName });
      form.reset();
      await loadComments(postId);
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDeleteComment(id, postId) {
    try {
      await deleteComment(id);
      await loadComments(postId);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800">Academic Hub</h2>
      <p className="text-gray-600 mb-6">Manage subjects, resources, and community posts</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded shadow p-4">
            <div className="flex gap-2 mb-3">
              <input className="border rounded px-3 py-2 flex-1" placeholder="Search subjects" value={subjectQuery} onChange={(e) => setSubjectQuery(e.target.value)} />
              <button className="bg-blue-600 text-white px-3 rounded" onClick={loadSubjects}>Search</button>
            </div>
            {loadingSubjects && <div className="text-sm text-gray-500">Loading...</div>}
            {errorSubjects && <div className="text-sm text-red-600">{errorSubjects}</div>}
            <ul className="space-y-2">
              {subjects.map(s => (
                <li key={s._id}>
                  <button className={`w-full text-left px-3 py-2 rounded ${selectedSubjectId === s._id ? 'bg-blue-100' : 'bg-gray-100'}`} onClick={() => setSelectedSubjectId(s._id)}>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-gray-600">{s.description}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {isGuideOrAdmin && (
          <div className="bg-white rounded shadow p-4 mt-6">
            <h3 className="font-semibold mb-2">Create Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-2">
              <input name="name" className="border rounded px-3 py-2 w-full" placeholder="Name" />
              <input name="description" className="border rounded px-3 py-2 w-full" placeholder="Description" />
              <input name="tags" className="border rounded px-3 py-2 w-full" placeholder="Tags (comma-separated)" />
              <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Create</button>
            </form>
          </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded shadow p-4 mb-6">
            <h3 className="font-semibold mb-2">Resources{selectedSubject ? ` • ${selectedSubject.name}` : ''}</h3>
            {loadingResources && <div className="text-sm text-gray-500">Loading...</div>}
            {errorResources && <div className="text-sm text-red-600">{errorResources}</div>}
            <ul className="space-y-2">
              {resources.map(r => (
                <li key={r._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded px-3 py-2 gap-2">
                  <div>
                    <div className="font-semibold break-words">{r.title}</div>
                    <a href={r.url} target="_blank" className="text-blue-600 text-sm" rel="noreferrer">{r.type.toUpperCase()}</a>
                  </div>
                  {isGuideOrAdmin && <button className="text-red-600 self-end sm:self-auto" onClick={() => handleDeleteResource(r._id)}>Delete</button>}
                </li>
              ))}
            </ul>
            {isGuideOrAdmin && (
            <form onSubmit={handleCreateResource} className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
              <input name="title" className="border rounded px-3 py-2" placeholder="Title" />
              <select name="type" className="border rounded px-3 py-2">
                <option value="pdf">pdf</option>
                <option value="link">link</option>
              </select>
              <input name="url" className="border rounded px-3 py-2" placeholder="URL" />
              <input name="description" className="border rounded px-3 py-2" placeholder="Description" />
              <button className="bg-green-600 text-white px-4 py-2 rounded col-span-1" type="submit">Add</button>
            </form>
            )}
          </div>

          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-2">Forum{selectedSubject ? ` • ${selectedSubject.name}` : ''}</h3>
            {loadingPosts && <div className="text-sm text-gray-500">Loading...</div>}
            {errorPosts && <div className="text-sm text-red-600">{errorPosts}</div>}
            <ul className="space-y-3">
              {posts.map(p => (
                <li key={p._id} className="border rounded p-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="font-semibold break-words">{p.title}</div>
                    {(isGuideOrAdmin || user?._id === p.author) && (
                      <button className="text-red-600 self-end sm:self-auto" onClick={() => handleDeletePost(p._id)}>Delete</button>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{p.content}</div>
                  <div className="text-xs text-gray-500 mt-1">by {p.authorName}</div>
                  <div className="mt-3">
                    <button className="text-blue-600" onClick={() => loadComments(p._id)}>Load comments</button>
                    <ul className="space-y-2 mt-2">
                      {(commentsMap[p._id] || []).map(c => (
                        <li key={c._id} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1">
                          <div>
                            <div className="text-sm">{c.content}</div>
                            <div className="text-xs text-gray-500">{c.authorName}</div>
                          </div>
                          {(isGuideOrAdmin || user?._id === c.author) && (
                            <button className="text-red-600" onClick={() => handleDeleteComment(c._id, p._id)}>Delete</button>
                          )}
                        </li>
                      ))}
                    </ul>
                    <form onSubmit={(e) => handleAddComment(e, p._id)} className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      <input name="content" className="border rounded px-3 py-2" placeholder="Write a comment" />
                      <input name="authorName" className="border rounded px-3 py-2" placeholder="Your name" />
                      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Comment</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
            <form onSubmit={handleCreatePost} className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              <input name="title" className="border rounded px-3 py-2" placeholder="Post title" />
              <input name="authorName" className="border rounded px-3 py-2" placeholder="Your name" />
              <textarea name="content" className="border rounded px-3 py-2 md:col-span-3" placeholder="Post content" rows={3} />
              <button className="bg-green-600 text-white px-4 py-2 rounded md:col-span-1" type="submit">Create Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademicHub;

