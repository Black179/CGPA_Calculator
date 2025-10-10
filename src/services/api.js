import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://cgpa-calculator-t42f.onrender.com',
  timeout: 10000,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  verifyToken: () => api.get('/api/auth/verify'),
};

export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (updates) => api.put('/api/user/profile', updates),
};

export const semesterAPI = {
  saveSemesterData: (data) => api.post('/api/semester/save', data),
  getSemesterData: () => api.get('/api/semester/data'),
};

export default api;
