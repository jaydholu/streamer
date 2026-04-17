import { Link } from 'react-router-dom';

export default function Brand({ to = '/home', size = 'md', withLink = true, onClick }) {
  const sizes = {
    sm: { icon: 24, text: 16 },
    md: { icon: 28, text: 20 },
    lg: { icon: 34, text: 26 },
    xl: { icon: 48, text: 40 },
  };
  const { icon, text } = sizes[size];

  const inner = (
    <div className="flex items-center gap-2.5 group">
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform group-hover:scale-110"
      >
        <rect width="64" height="64" rx="14" fill="#E50914" />
        <circle cx="32" cy="32" r="19.2" fill="none" stroke="white" strokeWidth="1" opacity="1" />
        <line x1="32" y1="12.8" x2="32" y2="20.3" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="48.6" y1="22.4" x2="42.7" y2="26.7" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="48.6" y1="41.6" x2="42.7" y2="37.3" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="32" y1="51.2" x2="32" y2="43.7" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="15.4" y1="41.6" x2="21.3" y2="37.3" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <line x1="15.4" y1="22.4" x2="21.3" y2="26.7" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="1" />
        <circle cx="32" cy="32" r="9.6" fill="rgba(0,0,0,0.2)" />
        <polygon points="28.3,26.1 28.3,37.9 37.9,32" fill="white" />
      </svg>
      <span
        className="font-black tracking-tight"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: text,
          color: 'var(--c-text)',
          lineHeight: 1,
        }}
      >
        Streamer<span style={{ color: 'var(--c-accent)' }}>.</span>
      </span>
    </div>
  );

  if (!withLink) return inner;

  return (
    <Link to={to} onClick={onClick} className="focus-ring rounded-lg">
      {inner}
    </Link>
  );
}
