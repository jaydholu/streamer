import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Brand from './Brand';

export default function AuthCard({
  children,
  backTo = '/',
  backLabel = 'Back',
  maxWidth = 440,
}) {
  return (
    <div
      className="w-full animate-scale-in"
      style={{ maxWidth }}
    >
      <div
        className="rounded-2xl p-7 sm:p-9 relative overflow-hidden"
        style={{
          background: 'var(--c-card)',
          border: '1px solid var(--c-border)',
          boxShadow:
            'var(--shadow-xl), 0 0 80px -20px rgba(229, 9, 20, 0.15)',
        }}
      >
        {/* Subtle red accent glow inside card */}
        <div
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(229, 9, 20, 0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          {/* Back link */}
          <div className="flex items-center justify-between mb-7">
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 text-xs transition-colors rounded-md px-2 py-1 -ml-2 focus-ring"
              style={{ color: 'var(--c-dim)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--c-text)';
                e.currentTarget.style.background = 'var(--c-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--c-dim)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft size={14} /> {backLabel}
            </Link>
            <Brand to="/" size="sm" />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
