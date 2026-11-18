import React from 'react';
import { cx } from '../lib/cx';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
  id,
  ...props
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;
  const descriptionId = description ? `${switchId}-description` : undefined;

  return (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={descriptionId}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cx(
        'group inline-flex items-start gap-3 text-left',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cx(
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-150',
          checked ? 'border-brand-500 bg-brand-500' : 'border-line bg-elevated group-hover:bg-hover',
        )}
      >
        <span
          className={cx(
            'absolute left-0.5 top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-150',
            checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-medium leading-tight text-ink">{label}</span>}
          {description && (
            <span id={descriptionId} className="mt-1 block text-xs leading-relaxed text-ink-muted">
              {description}
            </span>
          )}
        </span>
      )}
    </button>
  );
}
