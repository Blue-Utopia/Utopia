'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user has a valid token
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // TODO: Fetch user data
    }
  }, []);

  const authenticate = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      // Get nonce from server
      const { nonce } = await authApi.getNonce(address);

      // Sign the message
      const signature = await signMessageAsync({
        message: nonce,
      });

      // Verify signature and get JWT
      const response = await authApi.verify(address, signature, nonce);

      // Store token
      localStorage.setItem('authToken', response.token);
      setIsAuthenticated(true);
      setUser(response.user);

      toast.success('Successfully authenticated!');
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Logged out');
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    authenticate,
    logout,
  };
}

