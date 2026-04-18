import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../api/profiles';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

// Restore active profile from localStorage immediately to avoid avatar flash
function getSavedProfile() {
  try {
    const saved = localStorage.getItem('active_profile');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('active_profile');
    return null;
  }
}

export function ProfileProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(getSavedProfile);
  const [loading, setLoading] = useState(false);

  // Load profiles when authenticated — but wait for auth to finish loading first
  useEffect(() => {
    if (authLoading) return; // Don't react until auth state is settled

    if (isAuthenticated) {
      fetchProfiles();
    } else {
      setProfiles([]);
      setActiveProfile(null);
      localStorage.removeItem('active_profile');
    }
  }, [isAuthenticated, authLoading]);

  // Sync active profile with fresh server data once profiles load
  useEffect(() => {
    if (profiles.length > 0 && activeProfile) {
      const found = profiles.find((p) => p.id === activeProfile.id);
      if (found) {
        // Update with latest server data (name/avatar may have changed)
        setActiveProfile(found);
        localStorage.setItem('active_profile', JSON.stringify(found));
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
