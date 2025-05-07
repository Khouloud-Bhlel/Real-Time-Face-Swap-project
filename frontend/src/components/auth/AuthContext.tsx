import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { username?: string; email?: string }) => Promise<User>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set the auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch current user
          const response = await axios.get(`${API_BASE_URL}/users/me`);
          setUser(response.data as User);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Register a new user
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });
      // After registration, log the user in
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Login uses x-www-form-urlencoded format
      const formData = new FormData();
      formData.append('username', email); // FastAPI OAuth expects 'username' field
      formData.append('password', password);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      
      // Save token to localStorage
      const { access_token }: { access_token: string } = response.data as { access_token: string };
      localStorage.setItem('token', access_token);
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user details
      const userResponse = await axios.get(`${API_BASE_URL}/users/me`);
      setUser(userResponse.data as User);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (data: { username?: string; email?: string }): Promise<User> => {
    const response = await axios.put(`${API_BASE_URL}/users/me`, data);
    const updatedUser = response.data as User;
    setUser(updatedUser);
    return updatedUser;
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;