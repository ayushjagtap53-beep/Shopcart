import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // CRITICAL: Allows browser to send & store HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Authorization header if token is stored in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopkart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default API;
