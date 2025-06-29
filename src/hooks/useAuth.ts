import { useState, useEffect, useCallback } from 'react';
import { createSession, getSession } from '../services/api';

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
  const [initializing, setInitializing] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('aeon_token');
    if (token) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        token
      }));
      validateToken(token, true);
    } else {
      // No token, create new session
      createNewSession().finally(() => setInitializing(false));
    }
  }, []);

  // Validate token with backend
  const validateToken = async (token: string, isInit = false) => {
    try {
      const sessionData = await getSession(token);
      setAuthState(prev => ({
        ...prev,
        user: sessionData.user || { id: 'user', role: 'user' as 'user' | 'hr' },
        isAuthenticated: true
      }));
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('aeon_token');
      if (isInit) {
        // Try to create a new session if initial validation fails
        try {
          await createNewSession();
        } catch (createError) {
          console.error('Failed to create new session:', createError);
          logout();
        }
      } else {
        logout();
      }
    } finally {
      setInitializing(false);
    }
  };

  // Create new session
  const createNewSession = useCallback(async () => {
    try {
      const sessionData = await createSession();
      const token = sessionData.token;
      
      if (token) {
        localStorage.setItem('aeon_token', token);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          token,
          user: sessionData.user || { id: 'user', role: 'user' as 'user' | 'hr' }
        }));
        return token;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async (token?: string) => {
    try {
      if (token) {
        // Use provided token
        localStorage.setItem('aeon_token', token);
        await validateToken(token);
      } else {
        // Create new session
        await createNewSession();
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [createNewSession]);

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
    createNewSession,
    isTelegramWebApp,
    getTelegramUserId,
    initializing
  };
}; 