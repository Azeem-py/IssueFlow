import React from 'react';
import { XIcon } from './Icons';
import { cx } from '../lib/cx';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  closeLabel?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  closeLabel = 'Close dialog',
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => onClose();
    dialog.addEventListener('close', handleNativeClose);
    return () => dialog.removeEventListener('close', handleNativeClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cx(
        'm-auto w-[calc(100%-2rem)] rounded-xl border border-line bg-panel p-0 text-ink shadow-elevation-3',
        sizeStyles[size],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-subtle px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-1 text-xs leading-relaxed text-ink-muted">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="rounded-md p-1.5 text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {children && <div className="px-5 py-4">{children}</div>}

      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-subtle px-5 py-3">
          {footer}
        </div>
      )}
    </dialog>
  );
}
