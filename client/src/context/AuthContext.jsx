import { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await API.get('/auth/me');
        setUser(res.data.data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      const res = await API.post('/auth/register', formData);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response.data };
    }
  };

  const login = async (formData) => {
  try {
    const res = await API.post('/auth/login', formData);
    
    // Check if user is verified
    const userRes = await API.get('/auth/me');
    if (!userRes.data.data.isVerified) {
      return { 
        success: false, 
        error: { 
          message: 'Please verify your email before logging in. Check your email for the verification link.' 
        } 
      };
    }
    
    localStorage.setItem('token', res.data.token);
    await checkAuthStatus();
    return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response.data };
    }
  };

  const updateDetails = async (formData) => {
    try {
      const res = await API.put('/auth/updatedetails', formData);
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response.data };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const res = await API.put('/auth/updatepassword', passwordData);
      // Optionally re-authenticate after password change
      const token = res.data.token;
      localStorage.setItem('token', token);
      await checkAuthStatus();
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const res = await API.post('/users/address', addressData);
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      return {success: false, error: err.response.data}
    }
  }

  const deleteAddress = async (addressId) => {
    try {
      const res = await API.delete(`/users/address/${addressId}`);
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response.data };
    }
  }

  const setDefaultAddress = async (addressId) => {
    try {
      const res = await API.put(`/users/address/${addressId}/default`);
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response.data }
    }
  }

  const updateAddress = async (addressId, addressData) => {
    try {
      const res = await API.put(`/users/address/${addressId}`, addressData);
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response.data }
    }
  }

  const logout = async () => {
    try {
      await API.get('/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        checkAuthStatus,
        updateDetails,
        updatePassword,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        updateAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};