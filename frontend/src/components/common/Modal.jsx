import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  hideClose = false,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] modal-backdrop flex items-center justify-center p-4 animate-fade-in"
      style={{ animationDuration: '200ms' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={`${maxWidth} w-full rounded-2xl animate-scale-in`}
        style={{
          background: 'var(--c-elevated)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {(title || !hideClose) && (
          <div
            className="flex items-start justify-between px-6 pt-6 pb-4"
          >
            <div className="flex-1 min-w-0 pr-4">
              {title && (
                <h3
                  className="font-semibold leading-tight"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    color: 'var(--c-text)',
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm mt-1.5" style={{ color: 'var(--c-sub)' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors cursor-pointer focus-ring shrink-0"
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
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
