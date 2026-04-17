import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import AuthCard from '../components/common/AuthCard';
import { parseApiError } from '../utils/parseApiError';

export default function SignUpPage() {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    invite_code: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation matching backend rules
    if (form.fullname.trim().length < 2) {
      addToast('Full name must be at least 2 characters', 'error');
      return;
    }
    if (form.username.length < 3) {
      addToast('Username must be at least 3 characters', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      addToast('Username can only contain letters, numbers, and underscores', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (!form.invite_code.trim()) {
      addToast('Invite code is required', 'error');
      return;
    }
    setLoading(true);
    try {
      await signup({
        fullname: form.fullname,
        username: form.username,
        email: form.email,
        password: form.password,
        invite_code: form.invite_code,
      });
      addToast('Account created! Please sign in.', 'success');
      navigate('/signin');
    } catch (err) {
      addToast(parseApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard maxWidth={480}>
      <h1
        className="mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 28,
          color: 'var(--c-text)',
        }}
      >
        Claim your seat
      </h1>
      <p className="text-sm mb-7" style={{ color: 'var(--c-sub)' }}>
        You'll need an invite code from the admin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={form.fullname}
              onChange={set('fullname')}
              required
              className="input-base"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={set('username')}
              required
              className="input-base"
              placeholder="janedoe"
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            className="input-base"
            placeholder="jane@email.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="form-label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
              className="input-base"
              style={{ paddingRight: 44 }}
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors cursor-pointer focus-ring"
              style={{ color: 'var(--c-dim)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-dim)')}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            required
            className="input-base"
            placeholder="Retype password"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="form-label">Invite Code</label>
          <input
            type="text"
            value={form.invite_code}
            onChange={set('invite_code')}
            required
            className="input-base"
            placeholder="Ask your admin"
            autoComplete="off"
            style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
          />
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
          Create Account
        </Button>
      </form>

      <div
        className="mt-8 pt-6"
        style={{ borderTop: '1px solid var(--c-border)' }}
      >
        <p className="text-md text-center" style={{ color: 'var(--c-dim)' }}>
          Have an account?{' '}
          <Link
            to="/signin"
            className="font-semibold"
            style={{ color: 'var(--c-accent)' }}
          >
            Sign in <span className="text-lg">→</span>
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
