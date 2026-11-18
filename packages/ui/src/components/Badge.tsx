import React from 'react';
import { cx } from '../lib/cx';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'orange'
  | 'teal';

export type BadgeVariant = 'subtle' | 'solid' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
}

const subtle: Record<BadgeTone, string> = {
  neutral: 'border-slate-700 bg-slate-800/70 text-slate-300',
  brand: 'border-brand-500/25 bg-brand-500/10 text-brand-300',
  success: 'border-success/25 bg-success/10 text-emerald-300',
  warning: 'border-warning/25 bg-warning/10 text-amber-300',
  danger: 'border-danger/25 bg-danger/10 text-red-300',
  info: 'border-info/25 bg-info/10 text-sky-300',
  purple: 'border-purple/25 bg-purple/10 text-violet-300',
  orange: 'border-orange/25 bg-orange/10 text-orange-300',
  teal: 'border-teal-500/25 bg-teal-500/10 text-teal-300',
};

const solid: Record<BadgeTone, string> = {
  neutral: 'border-slate-700 bg-slate-700 text-white',
  brand: 'border-brand-500 bg-brand-500 text-slate-950',
  success: 'border-success bg-success text-slate-950',
  warning: 'border-warning bg-warning text-slate-950',
  danger: 'border-red-600 bg-red-600 text-white',
  info: 'border-info bg-info text-white',
  purple: 'border-purple bg-purple text-white',
  orange: 'border-orange bg-orange text-slate-950',
  teal: 'border-teal-500 bg-teal-500 text-slate-950',
};

const outlineText: Record<BadgeTone, string> = {
  neutral: 'text-slate-300',
  brand: 'text-brand-300',
  success: 'text-emerald-300',
  warning: 'text-amber-300',
  danger: 'text-red-300',
  info: 'text-sky-300',
  purple: 'text-violet-300',
  orange: 'text-orange-300',
  teal: 'text-teal-300',
};

export function Badge({
  tone = 'neutral',
  variant = 'subtle',
  size = 'sm',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border font-medium leading-none',
        size === 'sm' ? 'h-5 px-2 text-[11px]' : 'h-6 px-2.5 text-xs',
        variant === 'subtle' && subtle[tone],
        variant === 'solid' && solid[tone],
        variant === 'outline' && cx('border-current bg-transparent', outlineText[tone]),
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
