import React from 'react';
import { cx } from '../lib/cx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, wrapperClassName, className, id, required, rows = 4, ...props },
  ref,
) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const message = error ?? hint;
  const messageId = message ? `${textareaId}-message` : undefined;

  return (
    <div className={cx('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 flex items-center gap-1 text-xs font-medium text-ink-secondary">
          {label}
          {required && (
            <span aria-hidden="true" className="text-red-300">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cx(
          'min-h-24 w-full resize-y rounded-md border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
          error
            ? 'border-danger/60 focus:border-danger focus:ring-danger/25'
            : 'border-line hover:border-slate-600 focus:border-brand-500 focus:ring-brand-500/20',
          className,
        )}
        {...props}
      />

      {message && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={cx('mt-1.5 text-xs', error ? 'text-red-300' : 'text-ink-muted')}
        >
          {message}
        </p>
      )}
    </div>
  );
});
