'use client';

import { useAccount, useSignMessage } from 'wagmi';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const {
    isAuthenticated,
    isLoading,
    user,
    signup: contextSignup,
    signin: contextSignin,
    logout: contextLogout,
    setAuthenticated,
  } = useAuthContext();

  const authenticate = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Get nonce from server
      const { nonce } = await authApi.getNonce(address);

      // Sign the message
      const signature = await signMessageAsync({
        message: nonce,
      });

      // Verify signature and get JWT
      const response = await authApi.verify(address, signature, nonce);

      // Update context
      setAuthenticated(response.token, response.user);

      toast.success('Successfully authenticated!');
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    }
  };

  const signup = async (email: string, password: string, username?: string, displayName?: string) => {
    try {
      await contextSignup(email, password, username, displayName);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      await contextSignin(email, password);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Signin error:', error);
      toast.error(error.message || 'Signin failed');
      throw error;
    }
  };

  const logout = () => {
    contextLogout();
    toast.success('Logged out');
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    authenticate,
    signup,
    signin,
    logout,
  };
}

