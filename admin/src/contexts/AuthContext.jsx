import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // Set axios default headers
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://mrattireco.com/backend/api/v1/auth/login', {
        email,
        password
      });
      
      const { token: newToken } = response.data;

      let user;

      if(newToken) {
        const res = await axios.get('https://mrattireco.com/backend/api/v1/auth/me', {headers: {'Authorization': `Bearer ${newToken}`}});
        user = res.data.data;
      }
      
      // Check if user is admin
      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      setToken(newToken);
      setCurrentUser(user);
      localStorage.setItem('adminToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  };

  // const checkAuthStatus = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     if (token) {
  //       const res = await API.get('/auth/me');
  //       setUser(res.data.data);
  //       setIsAuthenticated(true);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get('https://mrattireco.com/backend/api/v1/auth/me');
      if (response.data.data.role === 'admin') {
        setCurrentUser(response.data.data);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};