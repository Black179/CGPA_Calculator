import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://cgpa-calculator-backend.vercel.app', // Production backend URL
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Type': 'application/json'
  },
  params: {
    _t: Date.now() // Add timestamp to prevent caching
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
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
      // Token expired or invalid - remove both admin and regular tokens
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Create axios instance without interceptors for auth requests
const authApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// API Endpoints
export const authAPI = {
  register: (userData) => authApi.post('/api/auth/register', userData),
  login: (credentials) => authApi.post('/api/auth/login', credentials),
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

export const adminAPI = {
  login: (credentials) => authApi.post('/api/admin/login', credentials),
  getAllUsers: () => api.get('/api/admin/users'),
  getStats: () => api.get('/api/admin/stats'),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role`, { role }),
};

export default api;