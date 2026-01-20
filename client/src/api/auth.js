import { request } from './http';

export function register(payload) {
  return request(`/auth/register`, { method: 'POST', body: JSON.stringify(payload) });
}

export function login(payload) {
  return request(`/auth/login`, { method: 'POST', body: JSON.stringify(payload) });
}

export function me() {
  return request(`/auth/me`);
}

export function logout() {
  return request(`/auth/logout`, { method: 'POST' });
}

export function requestGuideRole() {
  return request(`/auth/request-guide`, { method: 'POST' });
}

