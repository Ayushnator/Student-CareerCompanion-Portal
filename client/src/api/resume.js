import { request } from './http';

export function getResumes() {
  return request('/resumes');
}

export function getResume(id) {
  return request(`/resumes/${id}`);
}

export function createResume(data) {
  return request('/resumes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function uploadResume(formData) {
    return request('/resumes/upload', {
        method: 'POST',
        body: formData
    });
}

export function updateResume(id, data) {
  return request(`/resumes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteResume(id) {
  return request(`/resumes/${id}`, {
    method: 'DELETE',
  });
}

export function analyzeResume(id) {
  return request(`/resumes/${id}/analyze`, {
    method: 'POST',
  });
}

export function getResumeFile(id) {
    return request(`/resumes/${id}/view`, {
        method: 'GET'
    });
}
