'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔵 Login attempt:', { email, API_URL });
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success(`Welcome back, ${userData.name}! 🩸`);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMsg = error.response?.data?.error || 'Login failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔵 Register attempt:', { 
        url: `${API_URL}/auth/register`, 
        data: userData 
      });

      // ✅ Full URL use করুন
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Register response:', response.data);

      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Account created successfully! Welcome to BloodLink ❤️');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('❌ Register error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.message || 
                       error.message ||
                       'Registration failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const uploadProfileImage = async (file) => {
    try {
      if (!token) {
        toast.error('Please login first');
        return { success: false };
      }

      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.post(`${API_URL}/auth/upload-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        timeout: 60000
      });

      if (response.data.success) {
        const updatedUser = { ...user, profileImage: response.data.imageUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile image updated successfully!');
        return { 
          success: true, 
          imageUrl: response.data.imageUrl,
          thumbUrl: response.data.thumbUrl 
        };
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    loading,
    API_URL,  // ✅ Export করলাম যাতে অন্য কোথাও use করা যায়
    login,
    register,
    logout,
    uploadProfileImage,
    updateUser,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}