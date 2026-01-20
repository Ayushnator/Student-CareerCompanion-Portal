import { request } from './http';

export function getJobs() {
  return request('/jobs');
}

export function createJob(data) {
  return request('/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function recommendJobs(resumeId) {
  return request('/jobs/recommend', {
    method: 'POST',
    body: JSON.stringify({ resumeId }),
  });
}
