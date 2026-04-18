import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle responses & errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network/connection errors
    if (!error.response) {
      // No response means network error or server not reachable
      const networkError = {
        status: 503,
        message: error.message === 'Network Error' 
          ? 'Server is not responding. Please check if the server is running.'
          : error.message || 'Network error occurred. Please check your connection.',
        type: 'NETWORK_ERROR'
      };
      return Promise.reject({
        ...error,
        response: { status: 503, data: networkError }
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle other HTTP errors
    if (error.response?.status >= 500) {
      const serverError = {
        ...error.response.data,
        type: 'SERVER_ERROR',
        message: error.response.data?.message || 'Server error occurred. Please try again later.'
      };
      return Promise.reject({
        ...error,
        response: { ...error.response, data: serverError }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
