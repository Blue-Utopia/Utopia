'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  walletAddress?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signup: (email: string, password: string, username?: string, displayName?: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuthenticated: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user has a valid token on mount
    const checkAuth = () => {
      try {
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('authToken');
        if (token) {
          // Token exists, set as authenticated
          // TODO: Verify token with backend and fetch user data
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signup = async (email: string, password: string, username?: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.signup(email, password, username, displayName);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
      }
      
      setIsAuthenticated(true);
      setUser(response.user);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const signin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.signin(email, password);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
      }
      
      setIsAuthenticated(true);
      setUser(response.user);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  };

  const setAuthenticated = (token: string, userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    setIsAuthenticated(true);
    setUser(userData);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signup,
        signin,
        logout,
        setAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

