import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Brand from '../common/Brand';

export default function Footer() {
  return (
    <footer className="mt-24 pb-10 px-4 md:px-12 relative">
      <div
        className="h-px w-full mb-10"
        style={{
          background:
            'linear-gradient(to right, transparent, var(--c-border-h), transparent)',
        }}
      />
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Brand to="/home" size="sm" />
            <p className="text-xs max-w-sm" style={{ color: 'var(--c-dim)' }}>
              A private cinema for you and your circle. Built for movie nights that
              actually happen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/settings">Settings</FooterLink>
            <FooterLink to="/watchlist">My List</FooterLink>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: 'var(--c-dim)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-dim)')}
            >
              TMDB
            </a>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-6"
          style={{ borderTop: '1px solid var(--c-border)' }}
        >
          <p className="text-[11px]" style={{ color: 'var(--c-faint)' }}>
            © {new Date().getFullYear()} Streamer · v1.0 · Private streaming, invite-only.
          </p>
          <p
            className="text-[11px] flex items-center gap-1.5"
            style={{ color: 'var(--c-faint)' }}
          >
            Crafted with <Heart size={11} style={{ color: 'var(--c-accent)' }} fill="currentColor" /> for late-night watch parties
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-xs transition-colors"
      style={{ color: 'var(--c-dim)' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-text)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-dim)')}
    >
      {children}
    </Link>
  );
}
