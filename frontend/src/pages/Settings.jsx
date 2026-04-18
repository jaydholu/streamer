import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Lock,
  User as UserIcon,
  Palette,
  Sun,
  Moon,
} from 'lucide-react';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { parseApiError } from '../utils/parseApiError';

export default function SettingsPage() {
  const { user, signout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [delLoading, setDelLoading] = useState(false);

  useEffect(() => {
    authAPI.getMe()
      .then(({ data }) => setAccount(data))
      .catch(() => {});
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      addToast('New passwords do not match', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await authAPI.changePassword(passwords.current, passwords.new);
      addToast('Password changed successfully', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDelLoading(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      addToast('Account deleted', 'info');
      signout();
      navigate('/signin');
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-screen px-4 md:px-12 pt-8 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
            style={{ color: 'var(--c-accent)' }}
          >
            Account
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--c-text)',
            }}
          >
            Settings
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--c-sub)' }}>
            Manage your account, security, and appearance preferences.
          </p>
        </div>

        {/* Account Info */}
        <Section icon={UserIcon} title="Account Holder Information">
          <Row label="Full Name">
            {account?.fullname || '—'}
          </Row>
          <Row label="Username">
            {account?.username || '—'}
          </Row>
          <Row label="Email">
            {account?.email || '—'}
          </Row>
          <Row label="Role">
            <span
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize"
              style={{
                background:
                  (account?.role || user?.role) === 'admin'
                    ? 'var(--c-accent-muted)'
                    : 'var(--c-hover)',
                color:
                  (account?.role || user?.role) === 'admin' ? 'var(--c-accent)' : 'var(--c-sub)',
              }}
            >
              {account?.role || user?.role || 'member'}
            </span>
          </Row>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance">
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--c-dim)' }}>
              Choose how Streamer looks. Dark is recommended for night viewing.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ThemeOption
                icon={Moon}
                label="Dark"
                desc="Cinema mode"
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
              />
              <ThemeOption
                icon={Sun}
                label="Light"
                desc="Daylight mode"
                active={theme === 'light'}
                onClick={() => setTheme('light')}
              />
            </div>
          </div>
        </Section>

        {/* Change Password */}
        <Section icon={Lock} title="Change Password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                required
                className="input-base"
                autoComplete="current-password"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  required
                  minLength={6}
                  className="input-base"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="form-label">Confirm New</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  required
                  className="input-base"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button type="submit" loading={pwLoading}>
              Update Password
            </Button>
          </form>
        </Section>

        {/* Danger Zone */}
        <section
          className="rounded-2xl p-6 mt-8"
          style={{
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--c-err)',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h2
              className="font-bold text-lg"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--c-err)',
              }}
            >
              Danger Zone
            </h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--c-sub)' }}>
            Deleting your account is permanent. All profiles, watchlist items,
            and watch history will be removed from our servers. This action
            cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            Delete Account
          </Button>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Account"
        subtitle="This is permanent and cannot be undone."
      >
        <p className="text-sm mb-5" style={{ color: 'var(--c-sub)' }}>
          To confirm, enter your password below. All profiles, watchlists, and
          watch history will be permanently deleted.
        </p>
        <label className="form-label">Password</label>
        <input
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          className="input-base mb-5"
          placeholder="Your password"
          autoComplete="current-password"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={delLoading}
            disabled={!deletePassword}
            onClick={handleDeleteAccount}
          >
            Permanently Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section
      className="rounded-2xl p-6 mb-5"
      style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'var(--c-accent-muted)',
            color: 'var(--c-accent)',
          }}
        >
          <Icon size={18} />
        </div>
        <h2
          className="font-bold text-lg"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--c-text)',
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: 'var(--c-sub)' }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
        {children}
      </span>
    </div>
  );
}

function ThemeOption({ icon: Icon, label, desc, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer focus-ring transition-all text-left"
      style={{
        background: active ? 'var(--c-accent-muted)' : 'var(--c-surface)',
        border: active
          ? '1px solid var(--c-accent)'
          : '1px solid var(--c-border)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: active ? 'var(--c-accent)' : 'var(--c-hover)',
          color: active ? 'white' : 'var(--c-sub)',
        }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--c-text)' }}
        >
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--c-dim)' }}>
          {desc}
        </p>
      </div>
      {active && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'var(--c-accent)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 5l3 3 5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}
