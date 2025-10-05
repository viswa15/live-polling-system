// src/lib/api.js

const BASE_URL = '/api/auth';

const request = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Something went wrong');
  }
  return response.json();
};

export const register = (username, password) => {
  return request(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
};

export const login = (username, password) => {
  return request(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
};

export const logout = () => {
  return request(`${BASE_URL}/logout`, { method: 'POST' });
};

export const checkAuthStatus = () => {
  return request(`${BASE_URL}/status`, {
    headers: { 'Content-Type': 'application/json' },
  });
};