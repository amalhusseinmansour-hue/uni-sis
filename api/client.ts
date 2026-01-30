import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with timeout
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
// SECURITY: Check sessionStorage first (more secure), then localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors - suppress all console logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-logout on any error - let the app handle it gracefully
    // All console logging is suppressed to keep console clean
    return Promise.reject(error);
  }
);

export default apiClient;
