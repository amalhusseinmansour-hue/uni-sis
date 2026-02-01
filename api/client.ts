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

// Handle response errors - redirect to login on 401 only if no valid token exists
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if user is not on login page already
    // Don't clear storage - let the app handle re-authentication
    if (error.response?.status === 401) {
      const currentPath = window.location.hash || '';
      const isOnLoginPage = currentPath.includes('login');
      const hasToken = !!(sessionStorage.getItem('token') || localStorage.getItem('token'));

      // Only redirect if not already on login page and there's no token
      // If there IS a token but we got 401, the token might be expired - clear it
      if (!isOnLoginPage) {
        if (hasToken) {
          // Token exists but is invalid/expired - clear and redirect
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        window.location.href = '/#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
