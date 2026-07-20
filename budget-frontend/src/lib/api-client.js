import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

let authContext = null;

export const setAuthContext = (ctx) => {
  authContext = ctx;
};

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (authContext) {
        authContext.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
