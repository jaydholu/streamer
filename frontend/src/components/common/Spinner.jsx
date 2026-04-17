import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 20, className = '', color }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin ${className}`}
      style={{ color: color || 'var(--c-accent)' }}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--c-bg)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Spinner size={36} />
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ width: 36, height: 36 }}
          />
        </div>
        <span
          className="text-xs tracking-[0.3em] uppercase font-semibold"
          style={{ color: 'var(--c-dim)' }}
        >
          Loading
        </span>
      </div>
    </div>
  );
}
