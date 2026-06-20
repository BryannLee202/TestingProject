import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    // Check local storage for token on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      refreshUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async (tokenOverride) => {
    try {
      const token = tokenOverride || localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    refreshUser(token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
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
