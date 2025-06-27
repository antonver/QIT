import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  role: 'hr' | 'user';
  name?: string;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('aeon_token');
    if (token) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        token
      }));
      // Optionally validate token with backend
      validateToken(token);
    }
  }, []);

  // Validate token with backend
  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setAuthState(prev => ({
          ...prev,
          user: userData,
          isAuthenticated: true
        }));
      } else {
        // Token is invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    }
  };

  // Login function
  const login = useCallback(async (token: string) => {
    try {
      // For development/testing - accept any token
      if (import.meta.env.DEV && token === 'test-token') {
        localStorage.setItem('aeon_token', token);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          token,
          user: { id: 'test-user', role: 'user', name: 'Test User' }
        }));
        return;
      }
      
      // Store token
      localStorage.setItem('aeon_token', token);
      
      // Validate token and get user data
      await validateToken(token);
      
      // Reload page to ensure all components recognize the new auth state
      window.location.reload();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('aeon_token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }, []);

  // Check if running in Telegram WebApp
  const isTelegramWebApp = () => {
    return typeof window !== 'undefined' && 
           window.Telegram && 
           window.Telegram.WebApp;
  };

  // Get Telegram user ID if available
  const getTelegramUserId = () => {
    if (isTelegramWebApp()) {
      return window.Telegram?.WebApp.initDataUnsafe?.user?.id;
    }
    return null;
  };

  return {
    ...authState,
    login,
    logout,
    isTelegramWebApp,
    getTelegramUserId
  };
}; 