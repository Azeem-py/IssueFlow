import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon, XIcon } from './Icons';
import { cx } from '../lib/cx';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss delay in milliseconds. Defaults to 4500. */
  duration?: number;
}

interface ToastRecord extends ToastOptions {
  id: number;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const toneConfig: Record<ToastTone, { icon: React.ReactNode; accent: string }> = {
  success: { icon: <CheckCircleIcon className="size-4" />, accent: 'text-emerald-300' },
  error: { icon: <XCircleIcon className="size-4" />, accent: 'text-red-300' },
  warning: { icon: <AlertTriangleIcon className="size-4" />, accent: 'text-amber-300' },
  info: { icon: <InfoIcon className="size-4" />, accent: 'text-sky-300' },
};

export interface ToastProviderProps {
  children: React.ReactNode;
  max?: number;
}

export function ToastProvider({ children, max = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);
  const nextId = React.useRef(0);
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = React.useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ title, description, tone = 'info', duration = 4500 }: ToastOptions) => {
      const id = ++nextId.current;
      setToasts((current) => [
        ...current.slice(Math.max(0, current.length - (max - 1))),
        { id, title, description, tone, duration },
      ]);

      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss, max],
  );

  React.useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach(clearTimeout);
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((item) => {
          const config = toneConfig[item.tone];

          return (
            <div
              key={item.id}
              role={item.tone === 'error' ? 'alert' : 'status'}
              className={cx(
                'pointer-events-auto flex items-start gap-3 rounded-lg border border-subtle bg-elevated p-3 shadow-elevation-3',
                'motion-safe:animate-toast-in',
              )}
            >
              <span className={cx('mt-0.5 shrink-0', config.accent)}>{config.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight text-ink">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="rounded p-1 text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
