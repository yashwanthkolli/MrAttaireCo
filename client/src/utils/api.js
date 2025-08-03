import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  // baseURL: 'https://mrattireco.com/backend/api/v1',
  withCredentials: true
});

// Request interceptor for API calls
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default API;