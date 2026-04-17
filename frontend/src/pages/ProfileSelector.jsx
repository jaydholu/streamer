import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Lock, Pencil, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { profileAPI } from '../api/profiles';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import Brand from '../components/common/Brand';
import ProfileAvatar from '../components/common/ProfileAvatar';
import ThemeToggle from '../components/common/ThemeToggle';

export default function ProfileSelectorPage() {
  const { isAuthenticated, signout } = useAuth();
  const { profiles, fetchProfiles, selectProfile } = useProfile();
  const navigate = useNavigate();

  const [pinModal, setPinModal] = useState({ open: false, profile: null });
  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (isAuthenticated) fetchProfiles();
  }, [isAuthenticated]);

  useEffect(() => {
    if (profiles.length === 1 && !profiles[0].is_locked) {
      handleSelectProfile(profiles[0]);
    }
  }, [profiles]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSelectProfile = (profile) => {
    if (profile.is_locked) {
      setPinModal({ open: true, profile });
      setPin(['', '', '', '']);
      setPinError('');
      setTimeout(() => pinRefs[0]?.current?.focus(), 120);
      return;
    }
    selectProfile(profile);
    navigate('/home');
  };

  const handlePinInput = (index, value) => {
    if (cooldown > 0) return;
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setPinError('');
    if (value && index < 3) pinRefs[index + 1]?.current?.focus();
    if (value && index === 3 && newPin.every((d) => d)) verifyPin(newPin.join(''));
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1]?.current?.focus();
    }
  };

  const verifyPin = async (pinStr) => {
    try {
      await profileAPI.verifyPin(pinModal.profile.id, pinStr);
      selectProfile(pinModal.profile);
      setPinModal({ open: false, profile: null });
      navigate('/home');
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPinError('Incorrect PIN');
      setPin(['', '', '', '']);
      pinRefs[0]?.current?.focus();
      if (newAttempts >= 3) { setCooldown(30); setAttempts(0); }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      {/* Cinematic ambient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(229, 9, 20, 0.10) 0%, transparent 60%)',
            animation: 'float-glow 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 85%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 85%)',
          }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5">
        <Brand to="/home" size="md" withLink={false} />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => { signout(); navigate('/signin'); }}
            aria-label="Sign out"
            className="p-2 rounded-lg transition-colors cursor-pointer focus-ring"
            style={{ color: 'var(--c-sub)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--c-text)';
              e.currentTarget.style.background = 'var(--c-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--c-sub)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <p
          className="text-sm font-bold tracking-[0.3em] uppercase mb-4 animate-fade-in"
          style={{ color: 'var(--c-accent)' }}
        >
          Choose Your Profile
        </p>
        <h1
          className="text-3xl sm:text-5xl font-bold mb-14 text-center animate-fade-in stagger-1"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--c-text)',
          }}
        >
          Who's watching?
        </h1>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-12 max-w-4xl animate-fade-in-up stagger-2">
          {profiles.map((profile, i) => (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="group flex flex-col items-center gap-4 cursor-pointer focus-ring rounded-2xl p-2"
            >
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <ProfileAvatar
                  name={profile.name}
                  avatar={profile.avatar}
                  index={i}
                  size="2xl"
                  rounded="xl"
                  glow
                  className="transition-all duration-300 group-hover:ring-4"
                />
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    boxShadow:
                      '0 0 0 3px var(--c-accent), 0 16px 48px -8px rgba(229,9,20,0.5)',
                    borderRadius: 24,
                  }}
                />
                {profile.is_locked && (
                  <div
                    className="absolute -bottom-1 -right-1 rounded-full p-2"
                    style={{
                      background: 'var(--c-elevated)',
                      border: '2px solid var(--c-bg)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <Lock size={12} style={{ color: 'var(--c-sub)' }} />
                  </div>
                )}
              </div>
              <span
                className="text-sm sm:text-base font-medium transition-colors group-hover:text-[var(--c-text)]"
                style={{ color: 'var(--c-sub)' }}
              >
                {profile.name}
              </span>
            </button>
          ))}

          {profiles.length < 5 && (
            <button
              onClick={() => navigate('/profiles/manage')}
              className="group flex flex-col items-center gap-4 cursor-pointer focus-ring rounded-2xl p-2"
            >
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{
                  borderColor: 'var(--c-border-h)',
                  background: 'var(--c-surface)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-accent)';
                  e.currentTarget.style.background = 'var(--c-accent-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-border-h)';
                  e.currentTarget.style.background = 'var(--c-surface)';
                }}
              >
                <Plus size={38} style={{ color: 'var(--c-dim)' }} />
              </div>
              <span
                className="text-sm sm:text-base font-medium"
                style={{ color: 'var(--c-dim)' }}
              >
                Add Profile
              </span>
            </button>
          )}
        </div>

        <button
          onClick={() => navigate('/profiles/manage')}
          className="animate-fade-in stagger-3 btn btn-secondary btn-sm"
        >
          <Pencil size={14} /> Manage Profiles
        </button>
      </div>

      {/* PIN Modal */}
      <Modal
        isOpen={pinModal.open}
        onClose={() => setPinModal({ open: false, profile: null })}
        title={`Enter PIN`}
        subtitle={`This profile (${pinModal.profile?.name || ''}) is protected`}
      >
        <div className="flex flex-col items-center py-2">
          <div className="flex gap-3 mb-4">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={pinRefs[i]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinInput(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                disabled={cooldown > 0}
                className="w-14 h-16 text-center text-2xl font-bold rounded-xl outline-none transition-all focus-ring"
                style={{
                  background: 'var(--c-surface)',
                  color: 'var(--c-text)',
                  border: pinError
                    ? '2px solid var(--c-err)'
                    : '2px solid var(--c-border)',
                  opacity: cooldown > 0 ? 0.5 : 1,
                  fontFamily: 'var(--font-display)',
                }}
                onFocus={(e) => {
                  if (!pinError) e.currentTarget.style.borderColor = 'var(--c-accent)';
                }}
                onBlur={(e) => {
                  if (!pinError) e.currentTarget.style.borderColor = 'var(--c-border)';
                }}
              />
            ))}
          </div>
          {pinError && (
            <p className="text-sm font-medium" style={{ color: 'var(--c-err)' }}>
              {pinError}
            </p>
          )}
          {cooldown > 0 && (
            <p className="text-sm mt-2" style={{ color: 'var(--c-sub)' }}>
              Too many attempts. Try again in {cooldown}s
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
