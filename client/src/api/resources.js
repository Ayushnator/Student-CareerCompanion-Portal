import { request } from './http';

export function getResources({ subjectId, type } = {}) {
  const params = new URLSearchParams();
  if (subjectId) params.append('subjectId', subjectId);
  if (type) params.append('type', type);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request(`/resources${qs}`);
}

export function createResource(payload) {
  return request(`/resources`, { method: 'POST', body: JSON.stringify(payload) });
}

export function getResource(id) {
  return request(`/resources/${id}`);
}

export function updateResource(id, payload) {
  return request(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteResource(id) {
  return request(`/resources/${id}`, { method: 'DELETE' });
}

