import { useState, useCallback, createContext, useContext } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};
const COLORS = {
  success: 'var(--c-ok)',
  error: 'var(--c-err)',
  warning: 'var(--c-warn)',
  info: 'var(--c-info)',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[1000] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-2.5rem)]">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl animate-slide-in min-w-[280px] max-w-[400px] glass-strong"
              style={{
                borderLeft: `6px solid ${COLORS[toast.type]}`,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <Icon
                size={18}
                style={{ color: COLORS[toast.type], flexShrink: 0, marginTop: 1 }}
              />
              <p className="text-sm flex-1 leading-snug" style={{ color: 'var(--c-text)' }}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="transition-colors cursor-pointer shrink-0 focus-ring rounded"
                style={{ color: 'var(--c-dim)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-dim)')}
              >
                <X size={15} className={`text-${COLORS[toast.type]}`} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
