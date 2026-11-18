import React from 'react';
import { cx } from '../lib/cx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  wrapperClassName?: string;
}

const fieldBase =
  'w-full rounded-md border bg-canvas text-sm text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-elevated/40';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightSlot,
    wrapperClassName,
    className,
    id,
    required,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const message = error ?? hint;
  const messageId = message ? `${inputId}-message` : undefined;

  return (
    <div className={cx('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1 text-xs font-medium text-ink-secondary">
          {label}
          {required && (
            <span aria-hidden="true" className="text-red-300">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-ink-muted [&_svg]:size-4">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className={cx(
            fieldBase,
            'h-9 px-3',
            Boolean(leftIcon) && 'pl-9',
            Boolean(rightSlot) && 'pr-10',
            error
              ? 'border-danger/60 focus:border-danger focus:ring-danger/25'
              : 'border-line hover:border-slate-600 focus:border-brand-500 focus:ring-brand-500/20',
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">{rightSlot}</span>
        )}
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
