'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Check if user data exists in localStorage (no token since it's in HTTP-only cookie)
    const userData = localStorage.getItem('user');
    
    console.log('Auth context initialization - UserData:', !!userData);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Setting user from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      console.log('Attempting login with credentials:', { username: credentials.username });
      
      const response = await api.post('/api/auth/login', credentials);
      console.log('Login response:', response);

      if (response.data && response.data.user) {
        const userData = response.data.user;
        console.log('Login successful, user data:', userData);
        
        // Store user data in localStorage (token is automatically stored as HTTP-only cookie)
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        toast.success('Login successful!');
        return true;
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Login failed: Invalid response from server');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      console.log('Attempting registration with data:', { 
        username: data.username, 
        email: data.email, 
        role: data.role 
      });
      
      const response = await api.post('/api/auth/register', data);
      console.log('Registration response:', response);

      if (response.status === 201) {
        toast.success('Registration successful! Please log in.');
        return true;
      } else {
        toast.error('Registration failed');
        return false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'Username or email already exists';
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to clear the HTTP-only cookie
      await api.post('/api/auth/logout');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if backend call fails
    } finally {
      // Clear local user data
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 