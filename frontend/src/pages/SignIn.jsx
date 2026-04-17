import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import AuthCard from '../components/common/AuthCard';
import { parseApiError } from '../utils/parseApiError';

export default function SignInPage() {
  const { signin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem('remember_me') === 'true'
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signin(form.login, form.password, rememberMe);
      navigate('/profiles');
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <h1
        className="mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 28,
          color: 'var(--c-text)',
        }}
      >
        Welcome back
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--c-sub)' }}>
        Sign in to pick up where you left off.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">Username or Email</label>
          <input
            type="text"
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            required
            className="input-base"
            placeholder="you@email.com"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="form-label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="input-base"
              style={{ paddingRight: 44 }}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors cursor-pointer focus-ring"
              style={{ color: 'var(--c-dim)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-dim)')}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[var(--c-accent)]"
            />
            <span className="text-sm" style={{ color: 'var(--c-sub)' }}>
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium transition-opacity"
            style={{ color: 'var(--c-accent)' }}
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign In
        </Button>
      </form>

      <div
        className="mt-8 pt-6"
        style={{ borderTop: '1px solid var(--c-border)' }}
      >
        <p className="text-md text-center" style={{ color: 'var(--c-dim)' }}>
          No account?{' '}
          <Link
            to="/signup"
            className="font-semibold"
            style={{ color: 'var(--c-accent)' }}
          >
            Create one <span className="text-lg">→</span>
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
