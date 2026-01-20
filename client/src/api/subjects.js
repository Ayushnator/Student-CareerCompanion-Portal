import { request } from './http';

export function getSubjects(q) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return request(`/subjects${qs}`);
}

export function createSubject(payload) {
  return request(`/subjects`, { method: 'POST', body: JSON.stringify(payload) });
}

export function getSubject(id) {
  return request(`/subjects/${id}`);
}

export function updateSubject(id, payload) {
  return request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteSubject(id) {
  return request(`/subjects/${id}`, { method: 'DELETE' });
}

