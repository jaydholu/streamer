import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../api/auth';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import AuthCard from '../components/common/AuthCard';
import { parseApiError } from '../utils/parseApiError';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard backTo="/signin" backLabel="Back to Sign In">
      {sent ? (
        <div className="text-center py-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(34, 197, 94, 0.12)' }}
          >
            <CheckCircle2 size={32} style={{ color: 'var(--c-ok)' }} />
          </div>
          <h2
            className="mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--c-text)',
            }}
          >
            Check your inbox
          </h2>
          <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--c-sub)' }}>
            If an account with that email exists, we've sent a password reset link. The link expires in 30 minutes.
          </p>
          <Link
            to="/signin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-6 transition-opacity"
            style={{ color: 'var(--c-accent)' }}
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'var(--c-accent-muted)' }}
          >
            <Mail size={24} style={{ color: 'var(--c-accent)' }} />
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
            Forgot password?
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--c-sub)' }}>
            Enter your email and we'll send you a secure reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-base"
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Send Reset Link
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
