import { Link, Navigate } from 'react-router-dom';
import {
  Play,
  ChevronRight,
  Film,
  Users,
  Bookmark,
  Shield,
  Tv,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Brand from '../components/common/Brand';
import ThemeToggle from '../components/common/ThemeToggle';

const FEATURES = [
  {
    icon: Users,
    title: 'Multiple Profiles',
    desc: 'One account for the whole household. PIN-lock available for any profile.',
  },
  {
    icon: Film,
    title: 'Resume Anywhere',
    desc: 'Continue where you left off — every device, every time.',
  },
  {
    icon: Bookmark,
    title: 'Your Watchlist',
    desc: 'Save what catches your eye. Come back to it when the mood is right.',
  },
  {
    icon: Shield,
    title: 'Invite Only',
    desc: 'Private by design. No public signups — ever.',
  },
];

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  // If already signed in, skip landing and go to home
  if (!loading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      {/* ═══ Cinematic Backdrop ═════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Core red glow — top center */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(229, 9, 20, 0.22) 0%, rgba(229, 9, 20, 0.05) 40%, transparent 70%)',
            animation: 'float-glow 10s ease-in-out infinite',
          }}
        />
        {/* Deep crimson bottom right */}
        <div
          className="absolute -bottom-40 -right-32 w-[750px] h-[750px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(184, 29, 36, 0.14) 0%, transparent 60%)',
            animation: 'float-glow 14s ease-in-out infinite 3s',
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      {/* ═══ Nav ════════════════════════════════════════════ */}
      <nav className="relative z-10 flex items-center justify-between px-5 sm:px-8 md:px-16 py-6">
        <Brand to="/" size="md" />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/signin"
            className="btn btn-ghost btn-sm hidden sm:inline-flex"
          >
            Sign in
          </Link>
          <Link to="/signup" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ═══ Hero ═══════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-5 sm:px-8 text-center">
        {/* Status badge */}
        <div
          className="animate-fade-in mb-8 inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass"
          style={{ border: '1px solid var(--c-border)' }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: 'var(--c-ok)',
              boxShadow: '0 0 12px rgba(34, 197, 94, 0.8)',
              animation: 'float-glow 2s ease-in-out infinite',
            }}
          />
          <span
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: 'var(--c-sub)' }}
          >
            Private · Invite Only
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in stagger-1 leading-[1.02] tracking-tight max-w-4xl"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
            color: 'var(--c-text)',
          }}
        >
          Our movies.
          <br />
          <span className="text-gradient-brand">Your people.</span>
          <br />
          Us cinema.
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in stagger-2 mt-8 max-w-xl leading-relaxed text-balance"
          style={{ color: 'var(--c-sub)', fontSize: 'clamp(15px, 2vw, 17px)' }}
        >
          A private streaming space for you and your circle. Browse thousands of
          titles, pick up right where you left off, and never argue about whose
          turn it is to pick again.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in stagger-3 flex flex-col sm:flex-row items-center gap-3 mt-12 w-full sm:w-auto">
          <Link
            to="/signup"
            className="btn btn-primary btn-xl group w-full sm:w-auto"
          >
            <Play size={20} fill="white" strokeWidth={0} />
            Start Watching
            <ChevronRight
              size={18}
              className="opacity-70 group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            to="/signin"
            className="btn btn-secondary btn-xl w-full sm:w-auto"
          >
            I have an account
          </Link>
        </div>

        {/* Feature pills */}
        <div className="animate-fade-in stagger-4 flex flex-wrap justify-center gap-3 mt-16">
          {[
            { icon: Tv, label: 'Movies & TV' },
            { icon: Users, label: 'Multi-profile' },
            { icon: Sparkles, label: 'Continue watching' },
            { icon: Shield, label: 'Private & safe' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-full"
              style={{
                color: 'var(--c-sub)',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
              }}
            >
              <Icon size={13} style={{ color: 'var(--c-accent)' }} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Feature Grid ═══════════════════════════════════ */}
      <section className="relative z-10 px-5 sm:px-8 md:px-16 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <p
            className="text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--c-accent)' }}
          >
            Built for movie nights
          </p>
          <h2
            className="font-bold leading-tight max-w-2xl mx-auto text-balance"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--c-text)',
            }}
          >
            Cinema-grade experience.
            <br />
            <span style={{ color: 'var(--c-sub)' }}>Zero friction.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i} />
          ))}
        </div>
      </section>

      {/* ═══ Bottom CTA ═════════════════════════════════════ */}
      <section className="relative z-10 px-5 sm:px-8 py-24 text-center">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-10 md:p-14 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(229, 9, 20, 0.12) 0%, rgba(184, 29, 36, 0.04) 100%)',
            border: '1px solid rgba(229, 9, 20, 0.25)',
          }}
        >
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-40"
            style={{
              background:
                'radial-gradient(circle, rgba(229, 9, 20, 0.3) 0%, transparent 70%)',
            }}
          />
          <h3
            className="relative font-bold mb-4 leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              color: 'var(--c-text)',
            }}
          >
            Got an invite?
          </h3>
          <p
            className="relative mb-8 max-w-md mx-auto text-pretty"
            style={{ color: 'var(--c-sub)', fontSize: 15 }}
          >
            Your invite code from the admin is your ticket. Grab some popcorn
            and get comfortable.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            <Play size={18} fill="white" strokeWidth={0} />
            Claim Your Seat
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═════════════════════════════════════════ */}
      <footer className="relative z-10 px-5 sm:px-8 md:px-16 py-10 border-t" style={{ borderColor: 'var(--c-border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Brand to="/" size="sm" />
          <p className="text-xs" style={{ color: 'var(--c-faint)' }}>
            © {new Date().getFullYear()} Streamer · Private, invite-only.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
  return (
    <div
      className="group relative p-6 rounded-2xl transition-all duration-300 animate-fade-in-up"
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        animationDelay: `${delay * 100 + 200}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--c-accent)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--c-border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all"
        style={{
          background: 'var(--c-accent-muted)',
          color: 'var(--c-accent)',
        }}
      >
        <Icon size={22} />
      </div>
      <h3
        className="font-semibold mb-2 leading-tight"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          color: 'var(--c-text)',
        }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--c-sub)' }}>
        {desc}
      </p>
    </div>
  );
}
