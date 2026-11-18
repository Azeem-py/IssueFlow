import React from 'react';
import { ChevronDownIcon } from './Icons';
import { cx } from '../lib/cx';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, wrapperClassName, className, id, required, children, ...props },
  ref,
) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const message = error ?? hint;
  const messageId = message ? `${selectId}-message` : undefined;

  return (
    <div className={cx('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 flex items-center gap-1 text-xs font-medium text-ink-secondary">
          {label}
          {required && (
            <span aria-hidden="true" className="text-red-300">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative has-[:disabled]:opacity-55">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className={cx(
            'h-9 w-full appearance-none rounded-md border bg-canvas px-3 pr-9 text-sm text-ink transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-elevated/40 disabled:text-ink-disabled',
            error
              ? 'border-danger/60 focus:border-danger focus:ring-danger/25'
              : 'border-line hover:border-slate-600 focus:border-brand-500 focus:ring-brand-500/20',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
      </div>

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
