import { request } from './http';

export function sendMessage(message, type = 'mentor', context = '') {
  return request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, type, context }),
  });
}

export function getHistory(type = 'mentor') {
  return request(`/ai/history?type=${type}`);
}

export function clearHistory(type = 'mentor') {
  return request(`/ai/history?type=${type}`, { method: 'DELETE' });
}
