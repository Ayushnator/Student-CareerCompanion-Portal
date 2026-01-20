import { request } from './http';

export function getPosts({ subjectId } = {}) {
  const qs = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
  return request(`/posts${qs}`);
}

export function createPost(payload) {
  return request(`/posts`, { method: 'POST', body: JSON.stringify(payload) });
}

export function getPost(id) {
  return request(`/posts/${id}`);
}

export function updatePost(id, payload) {
  return request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deletePost(id) {
  return request(`/posts/${id}`, { method: 'DELETE' });
}

export function addComment(postId, payload) {
  return request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(payload) });
}

export function listComments(postId) {
  return request(`/posts/${postId}/comments`);
}

export function deleteComment(commentId) {
  return request(`/posts/comments/${commentId}`, { method: 'DELETE' });
}

