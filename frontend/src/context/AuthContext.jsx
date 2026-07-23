import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const refreshUser = async (tokenOverride) => {
    try {
      const token = tokenOverride || localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/users/profile?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check local storage for token on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      refreshUser(token);
    } else {
      setLoading(false);
    }

    // Set up axios interceptor to always attach token if available and disable cache
    const reqInterceptor = axios.interceptors.request.use(config => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      // Prevent browser caching globally for all API requests
      if (config.method === 'get') {
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';
        // Thêm timestamp để vô hiệu hóa hoàn toàn cache của trình duyệt (đặc biệt là Safari/Chrome cũ)
        config.params = { ...config.params, _t: Date.now() };
      }
      return config;
    }, error => Promise.reject(error));

    // Handle 401/403 responses globally to log out if token is expired
    const resInterceptor = axios.interceptors.response.use(response => response, error => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Only auto-logout if we're not already on the login page or trying to login
        if (localStorage.getItem('token')) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
        }
      }
      return Promise.reject(error);
    });

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    refreshUser(token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
