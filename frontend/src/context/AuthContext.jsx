import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper: find which storage has the tokens
function findTokenStorage() {
  if (localStorage.getItem('access_token')) return localStorage;
  if (sessionStorage.getItem('access_token')) return sessionStorage;
  // Check refresh token too (access may have been cleared but refresh still exists)
  if (localStorage.getItem('refresh_token')) return localStorage;
  if (sessionStorage.getItem('refresh_token')) return sessionStorage;
  return null;
}

function clearAllAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  sessionStorage.removeItem('user');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount — attempt refresh if access token expired
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storage = findTokenStorage();
      if (!storage) {
        setLoading(false);
        return;
      }

      const token = storage.getItem('access_token');
      const savedUser = storage.getItem('user');
      const refreshToken = storage.getItem('refresh_token');

      // If we have a valid (non-expired) access token, use it
      if (token && savedUser) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp * 1000;
          if (Date.now() < expiry) {
            if (!cancelled) setUser(JSON.parse(savedUser));
            if (!cancelled) setLoading(false);
            return;
          }
        } catch {
          // Token malformed — fall through to refresh attempt
        }
      }

      // Access token missing or expired — try refreshing with the refresh token
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          // Store new tokens in the same storage
          storage.setItem('access_token', data.access_token);
          storage.setItem('refresh_token', data.refresh_token);

          // Decode new access token for user info
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          const userData = { id: payload.sub, role: payload.role };
          storage.setItem('user', JSON.stringify(userData));

          if (!cancelled) setUser(userData);
          if (!cancelled) setLoading(false);
          return;
        } catch {
          // Refresh token also expired/invalid — clear everything
        }
      }

      // No valid tokens — clean up
      clearAllAuth();
      if (!cancelled) setLoading(false);
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const signin = useCallback(async (login, password, rememberMe = false) => {
    const { data } = await authAPI.signin({ login, password });

    // Decide where to store tokens
    const storage = rememberMe ? localStorage : sessionStorage;

    // Save remember preference in localStorage (always persists)
    localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');

    // Clear opposite storage
    if (rememberMe) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }

    storage.setItem('access_token', data.access_token);
    storage.setItem('refresh_token', data.refresh_token);

    // Decode JWT payload to get user info
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    const userData = { id: payload.sub, role: payload.role };
    storage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const signup = useCallback(async (formData) => {
    const { data } = await authAPI.signup(formData);
    return data;
  }, []);

  const signout = useCallback(() => {
    authAPI.signout().catch(() => {});
    clearAllAuth();
    localStorage.removeItem('active_profile');
    localStorage.removeItem('remember_me');
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    signin,
    signup,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
