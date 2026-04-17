import { Link } from 'react-router-dom';
import { ArrowRight, Code, Database, Film, Palette } from 'lucide-react';
import Brand from '../components/common/Brand';

const STACK = [
  { icon: Code, label: 'React 19 · Vite' },
  { icon: Palette, label: 'Tailwind CSS v4' },
  { icon: Database, label: 'FastAPI · MongoDB' },
  { icon: Film, label: 'TMDB · Vidking' },
];

export default function AboutPage() {
  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-5 py-16 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(229, 9, 20, 0.1) 0%, transparent 65%)',
            animation: 'float-glow 10s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl text-center">
        <div className="mb-8 flex justify-center animate-fade-in">
          <Brand to="/home" size="xl" withLink={false} />
        </div>

        <p
          className="text-xs font-bold tracking-[0.3em] uppercase mb-3 animate-fade-in stagger-1"
          style={{ color: 'var(--c-accent)' }}
        >
          Private Cinema · v1.0
        </p>

        <h1
          className="font-bold mb-5 leading-tight animate-fade-in stagger-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            color: 'var(--c-text)',
          }}
        >
          A streaming space that feels{' '}
          <span className="text-gradient-brand">yours</span>.
        </h1>

        <p
          className="text-[15px] leading-relaxed mb-10 text-pretty animate-fade-in stagger-3"
          style={{ color: 'var(--c-sub)' }}
        >
          Streamer is a private, invite-only streaming app built for small
          circles of friends. Browse thousands of movies and TV shows via
          TMDB, keep separate profiles with their own watchlists and progress,
          and pick up exactly where you left off across every device.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-10 animate-fade-in stagger-4">
          {STACK.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{
                background: 'var(--c-card)',
                border: '1px solid var(--c-border)',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'var(--c-accent-muted)',
                  color: 'var(--c-accent)',
                }}
              >
                <Icon size={16} />
              </div>
              <span
                className="text-[13px] font-medium text-left"
                style={{ color: 'var(--c-text)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <Link to="/home" className="btn btn-primary btn-lg animate-fade-in stagger-5">
          Back to Home
          <ArrowRight size={16} />
        </Link>

        <p
          className="text-[11px] mt-12 animate-fade-in stagger-6"
          style={{ color: 'var(--c-faint)' }}
        >
          © {new Date().getFullYear()} Streamer · Built with care for late-night watch parties
        </p>
      </div>
    </div>
  );
}
