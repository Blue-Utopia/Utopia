const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const authApi = {
  getNonce: async (walletAddress: string) => {
    return apiRequest('/api/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  },

  verify: async (walletAddress: string, signature: string, message: string) => {
    return apiRequest('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  },

  signup: async (email: string, password: string, username?: string, displayName?: string, role?: 'CLIENT' | 'DEVELOPER') => {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName, role }),
    });
  },

  signin: async (email: string, password: string) => {
    return apiRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

export const twilioApi = {
  sendCode: async (phoneNumber: string) => {
    return apiRequest('/api/twilio/send-code', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  },

  verifyCode: async (phoneNumber: string, code: string) => {
    return apiRequest('/api/twilio/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code }),
    });
  },
};

export const uploadApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const response = await fetch(`${API_URL}/api/upload/file`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  uploadFiles: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const response = await fetch(`${API_URL}/api/upload/files`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },
};

