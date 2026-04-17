import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../api/profiles';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load profiles when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfiles();
    } else {
      setProfiles([]);
      setActiveProfile(null);
      localStorage.removeItem('active_profile');
    }
  }, [isAuthenticated]);

  // Restore active profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('active_profile');
    if (saved && profiles.length > 0) {
      try {
        const parsed = JSON.parse(saved);
        const found = profiles.find((p) => p.id === parsed.id);
        if (found) setActiveProfile(found);
      } catch {
        localStorage.removeItem('active_profile');
      }
    }
  }, [profiles]);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await profileAPI.list();
      setProfiles(data.profiles || []);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectProfile = useCallback((profile) => {
    setActiveProfile(profile);
    localStorage.setItem('active_profile', JSON.stringify(profile));
  }, []);

  const clearProfile = useCallback(() => {
    setActiveProfile(null);
    localStorage.removeItem('active_profile');
  }, []);

  const value = {
    profiles,
    activeProfile,
    loading,
    fetchProfiles,
    selectProfile,
    clearProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};
