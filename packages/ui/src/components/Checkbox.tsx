import React from 'react';
import { cx } from '../lib/cx';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  wrapperClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, wrapperClassName, className, id, required, ...props },
  ref,
) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;
  const descriptionId = description ? `${checkboxId}-description` : undefined;

  return (
    <div className={cx('flex items-start gap-2.5', wrapperClassName)}>
      <input
        ref={ref}
        id={checkboxId}
        type="checkbox"
        required={required}
        aria-describedby={descriptionId}
        className={cx(
          'mt-0.5 size-4 shrink-0 cursor-pointer rounded border-line bg-canvas accent-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={checkboxId} className="block cursor-pointer text-sm font-medium leading-tight text-ink">
              {label}
              {required && (
                <span aria-hidden="true" className="ml-1 text-red-300">
                  *
                </span>
              )}
            </label>
          )}
          {description && (
            <p id={descriptionId} className="mt-1 text-xs leading-relaxed text-ink-muted">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
