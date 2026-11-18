import React from 'react';
import { cx } from '../lib/cx';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'danger-outline'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Accepts an icon node, or a Material Symbols ligature name such as "add". */
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border border-brand-500 bg-brand-500 text-slate-950 shadow-elevation-1 hover:border-brand-400 hover:bg-brand-400 active:border-brand-600 active:bg-brand-600',
  secondary:
    'border border-subtle bg-elevated text-ink hover:border-line hover:bg-hover active:bg-hover',
  outline:
    'border border-line bg-transparent text-ink-secondary hover:border-brand-500/60 hover:bg-brand-500/5 hover:text-ink active:bg-brand-500/10',
  ghost:
    'border border-transparent bg-transparent text-ink-muted hover:bg-hover hover:text-ink active:bg-hover',
  danger:
    'border border-red-600 bg-red-600 text-white shadow-elevation-1 hover:border-red-500 hover:bg-red-500 active:border-red-700 active:bg-red-700',
  'danger-outline':
    'border border-danger/40 bg-transparent text-red-300 hover:border-danger/70 hover:bg-danger/10 hover:text-red-200',
  link:
    'border border-transparent bg-transparent px-0 text-brand-300 underline-offset-4 hover:text-brand-200 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-sm px-3 text-xs',
  md: 'h-9 gap-2 rounded-md px-3.5 text-sm',
  lg: 'h-11 gap-2 rounded-lg px-5 text-sm',
  icon: 'size-9 rounded-md p-0',
};

function renderIcon(icon: React.ReactNode) {
  if (typeof icon === 'string') {
    return (
      <span aria-hidden="true" className="material-symbols-outlined text-[1.15em] leading-none">
        {icon}
      </span>
    );
  }

  return icon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    loading = false,
    fullWidth = false,
    className,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cx(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
        'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-standard',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:pointer-events-none disabled:opacity-50',
        !loading && disabled && 'disabled:saturate-0',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : icon ? renderIcon(icon) : null}
      {children}
      {!loading && iconRight ? renderIcon(iconRight) : null}
    </button>
  );
});
