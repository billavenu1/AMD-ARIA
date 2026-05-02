import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for logging/auth if needed
api.interceptors.request.use((config) => {
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
