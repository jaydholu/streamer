import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, AlertCircle } from 'lucide-react';
import { authAPI } from '../api/auth';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import AuthCard from '../components/common/AuthCard';
import { parseApiError } from '../utils/parseApiError';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthCard backTo="/signin" backLabel="Back to Sign In">
        <div className="text-center py-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(239, 68, 68, 0.12)' }}
          >
            <AlertCircle size={26} style={{ color: 'var(--c-err)' }} />
          </div>
          <h2
            className="mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--c-text)',
            }}
          >
            Invalid link
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--c-sub)' }}>
            This reset link is missing or expired. Request a new one below.
          </p>
          <Link to="/forgot-password" className="btn btn-primary">
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      addToast('Password reset successfully!', 'success');
      navigate('/signin');
    } catch (err) {
      addToast(
        parseApiError(err),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard backTo="/signin" backLabel="Back to Sign In">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'var(--c-accent-muted)' }}
      >
        <KeyRound size={24} style={{ color: 'var(--c-accent)' }} />
      </div>
      <h1
        className="mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 28,
          color: 'var(--c-text)',
        }}
      >
        Reset password
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--c-sub)' }}>
        Choose a strong password you haven't used before.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">New Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            className="input-base"
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required
            className="input-base"
            placeholder="Retype new password"
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Reset Password
        </Button>
      </form>
    </AuthCard>
  );
}
