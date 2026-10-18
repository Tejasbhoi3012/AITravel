import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('travelai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    // Auto logout on 401 Unauthorized if token expired
    if (error.response?.status === 401 && localStorage.getItem('travelai_token')) {
      // Optional auto cleanup
      // localStorage.removeItem('travelai_token');
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
