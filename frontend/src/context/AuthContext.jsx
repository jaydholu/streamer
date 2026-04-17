import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

// Helper: get storage based on remember preference
function getStorage() {
  return localStorage.getItem('remember_me') === 'true' ? localStorage : sessionStorage;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount — check BOTH storages
  useEffect(() => {
    let token = localStorage.getItem('access_token');
    let savedUser = localStorage.getItem('user');

    // If not in localStorage, check sessionStorage
    if (!token) {
      token = sessionStorage.getItem('access_token');
      savedUser = sessionStorage.getItem('user');
    }

    if (token && savedUser) {
      try {
        // Verify token isn't expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        if (Date.now() < expiry) {
          setUser(JSON.parse(savedUser));
        } else {
          // Token expired — clear everything
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          sessionStorage.clear();
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        sessionStorage.clear();
      }
    }
    setLoading(false);
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('active_profile');
    sessionStorage.clear();
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
