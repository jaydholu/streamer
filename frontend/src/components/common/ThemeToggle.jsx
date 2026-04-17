import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ size = 18, className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-lg transition-all cursor-pointer focus-ring ${className}`}
      style={{ color: 'var(--c-sub)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--c-text)';
        e.currentTarget.style.background = 'var(--c-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--c-sub)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div
        className="relative"
        style={{
          width: size,
          height: size,
        }}
      >
        <Sun
          size={size}
          className="absolute inset-0 transition-all duration-500"
          style={{
            opacity: theme === 'light' ? 1 : 0,
            transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
          }}
        />
        <Moon
          size={size}
          className="absolute inset-0 transition-all duration-500"
          style={{
            opacity: theme === 'dark' ? 1 : 0,
            transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
          }}
        />
      </div>
    </button>
  );
}
