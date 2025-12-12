import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authAPI, userAPI, semesterAPI, adminAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [semesterData, setSemesterData] = useState({});
  const [cgpaHistory, setCgpaHistory] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  // Configure axios defaults
  useEffect(() => {
    if (adminToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    } else if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, adminToken]);

  // Verify token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (adminToken) {
        try {
          const adminUser = JSON.parse(localStorage.getItem('adminUser'));
          setAdmin(adminUser);
        } catch (error) {
          console.error('Admin token verification failed:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setAdminToken(null);
          setAdmin(null);
        }
      } else if (token) {
        try {
          const response = await authAPI.verifyToken();
          setUser(response.data.user);

          // Load user semester data
          await loadUserData();
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token, adminToken]);

  const loadUserData = async () => {
    try {
      const response = await semesterAPI.getSemesterData();
      setSemesterData(response.data.semesterData || []);
      setCgpaHistory(response.data.cgpaHistory || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      // Load user data after login
      await loadUserData();

      return { success: true };
    } catch (error) {
      console.error('Login error:', error.message || error);

      let errorMessage = 'Login failed';

      if (error.response) {
        const status = error.response.status;
        const backendError = error.response.data?.error;

        if (status === 404) {
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
        } else if (status === 401) {
          errorMessage = backendError === 'Invalid credentials'
            ? 'The password you entered is incorrect. Please try again.'
            : backendError || 'Invalid email or password';
        } else if (status === 400) {
          errorMessage = backendError || 'Please check your login details';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = backendError || 'Login failed. Please try again.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await adminAPI.login({ email, password });
      const { token: newAdminToken, admin: adminData } = response.data;

      localStorage.setItem('adminToken', newAdminToken);
      localStorage.setItem('adminUser', JSON.stringify(adminData));
      setAdminToken(newAdminToken);
      setAdmin(adminData);

      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);

      let errorMessage = 'Admin login failed';

      if (error.response) {
        const status = error.response.status;
        const backendError = error.response.data?.error;

        if (status === 404) {
          errorMessage = 'Admin account not found';
        } else if (status === 401) {
          errorMessage = 'Invalid admin credentials';
        } else {
          errorMessage = backendError || 'Admin login failed';
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdmin(null);
  };

  const register = async (registerNumber, username, email, password) => {
    try {
      const response = await authAPI.register({
        registerNumber,
        username,
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed';

      if (error.response) {
        const status = error.response.status;
        const backendError = error.response.data?.error;

        if (status === 400) {
          if (backendError.includes('already exists')) {
            errorMessage = backendError; // "User already exists with this email or register number"
          } else if (backendError.includes('All fields are required')) {
            errorMessage = 'Please fill in all required fields';
          } else {
            errorMessage = backendError || 'Invalid registration data';
          }
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = backendError || 'Registration failed. Please try again.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Registration failed. Please try again.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSemesterData({});
    setCgpaHistory([]);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await userAPI.updateProfile(updates);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Profile update failed'
      };
    }
  };

  const saveSemesterData = async (semesterDataArray, cgpa, completedSemesters) => {
    try {
      await semesterAPI.saveSemesterData({
        semesterData: semesterDataArray,
        cgpa,
        completedSemesters
      });

      // Reload user data
      await loadUserData();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to save semester data'
      };
    }
  };

  const value = {
    user,
    admin,
    loading,
    isAuthenticated: !!user,
    isAdminAuthenticated: !!admin,
    semesterData,
    cgpaHistory,
    login,
    adminLogin,
    register,
    logout,
    adminLogout,
    updateProfile,
    saveSemesterData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
