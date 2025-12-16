'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  walletAddress?: string;
}

interface AuthResponse {
  token: string;
  user: User;
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

// Query key for auth state
const AUTH_QUERY_KEY = ['auth'] as const;

// Check if user has a token (client-side only check)
function checkAuthToken(): { token: string | null; hasToken: boolean } {
  if (typeof window === 'undefined') {
    return { token: null, hasToken: false };
  }
  const token = localStorage.getItem('authToken');
  return { token, hasToken: !!token };
}

// Fetch user data from backend (if we have a token)
async function fetchUser(): Promise<User | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = localStorage.getItem('authToken');
  if (!token) {
    return null;
  }

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query Me {
            me {
              id
              email
              username
              displayName
              walletAddress
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result.errors) {
      return null;
    }

    return result.data?.me || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Query to check auth state using TanStack Query
  const { data: authData, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<{ isAuthenticated: boolean; user: User | null; token: string | null }> => {
      const { token, hasToken } = checkAuthToken();
      
      if (!hasToken) {
        return { isAuthenticated: false, user: null, token: null };
      }

      // Try to fetch user data
      const user = await fetchUser();
      
      // If we have a token, consider authenticated (even if user fetch fails)
      return {
        isAuthenticated: true,
        user: user || null,
        token,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Signup mutation using TanStack Query
  const signupMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      username,
      displayName,
    }: {
      email: string;
      password: string;
      username?: string;
      displayName?: string;
    }): Promise<AuthResponse> => {
      return authApi.signup(email, password, username, displayName);
    },
    onSuccess: (data) => {
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      // Update query cache
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        isAuthenticated: true,
        user: data.user,
        token: data.token,
      });
    },
  });

  // Signin mutation using TanStack Query
  const signinMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<AuthResponse> => {
      return authApi.signin(email, password);
    },
    onSuccess: (data) => {
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      // Update query cache
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        isAuthenticated: true,
        user: data.user,
        token: data.token,
      });
    },
  });

  // Signup wrapper
  const signup = async (
    email: string,
    password: string,
    username?: string,
    displayName?: string
  ) => {
    return signupMutation.mutateAsync({ email, password, username, displayName });
  };

  // Signin wrapper
  const signin = async (email: string, password: string) => {
    return signinMutation.mutateAsync({ email, password });
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    
    // Clear query cache
    queryClient.setQueryData(AUTH_QUERY_KEY, {
      isAuthenticated: false,
      user: null,
      token: null,
    });

    // Invalidate queries to refetch
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  };

  // Set authenticated (for wallet auth)
  const setAuthenticated = (token: string, userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    
    // Update query cache
    queryClient.setQueryData(AUTH_QUERY_KEY, {
      isAuthenticated: true,
      user: userData,
      token,
    });
  };

  const value: AuthContextType = {
    isAuthenticated: authData?.isAuthenticated ?? false,
    isLoading: isLoading || signupMutation.isPending || signinMutation.isPending,
    user: authData?.user ?? null,
    signup,
    signin,
    logout,
    setAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
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

