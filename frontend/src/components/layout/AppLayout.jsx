import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import { FullPageSpinner } from '../common/Spinner';

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-bg)' }}>
      <Navbar />
      <main className="flex-1 pt-16 page-enter">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to="/profiles" replace />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 sm:p-6 relative overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      {/* Cinematic ambient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Red glow top center */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(229, 9, 20, 0.18) 0%, rgba(229, 9, 20, 0.04) 40%, transparent 70%)',
            animation: 'float-glow 10s ease-in-out infinite',
          }}
        />
        {/* Deep crimson bottom right */}
        <div
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(184, 29, 36, 0.12) 0%, transparent 65%)',
            animation: 'float-glow 14s ease-in-out infinite 3s',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
