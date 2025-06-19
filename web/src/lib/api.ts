import axios from 'axios';

// Base API URL - adjust this to match your Spring Boot backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This ensures cookies are sent with requests
});

// Request interceptor - no longer needed to add Authorization header since we're using cookies
api.interceptors.request.use(
  (config) => {
    // The token cookie will be automatically sent by the browser
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors for specific auth endpoints
    // Don't automatically logout on all 401 errors as this could be due to server issues
    if (error.response?.status === 401) {
      const url = error.config?.url;
      console.error('401 Unauthorized error for URL:', url, error.response);
      
      // Only auto-logout for certain critical auth endpoints
      if (url?.includes('/api/auth/') || url?.includes('/api/user/me')) {
        console.log('Auto-logout triggered for auth endpoint');
        if (typeof window !== 'undefined') {
          // Clear localStorage and redirect to login
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 