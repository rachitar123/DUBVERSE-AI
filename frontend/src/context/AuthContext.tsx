import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dubverse_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // ── Verify stored token on app startup ───────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ── Listen for 401 session-expired events dispatched by the API client ───
  useEffect(() => {
    const handleExpiry = () => {
      setToken(null);
      setUser(null);
      // Custom event so NotificationContext can also show a toast
      window.dispatchEvent(new CustomEvent('dubverse:show-toast', {
        detail: {
          title: 'Session Expired',
          message: 'Your login session has expired. Please sign in again.',
          type: 'error',
        }
      }));
    };
    window.addEventListener('dubverse:session-expired', handleExpiry);
    return () => window.removeEventListener('dubverse:session-expired', handleExpiry);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    localStorage.setItem('dubverse_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await authService.register(email, password, fullName);
    localStorage.setItem('dubverse_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('dubverse_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
