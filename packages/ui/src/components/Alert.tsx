import React from 'react';
import { cx } from '../lib/cx';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from './Icons';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const toneStyles: Record<
  AlertTone,
  { container: string; icon: React.ReactNode }
> = {
  info: {
    container: 'border-info/30 bg-info/10',
    icon: <InfoIcon className="size-4 text-sky-300" />,
  },
  success: {
    container: 'border-success/30 bg-success/10',
    icon: <CheckCircleIcon className="size-4 text-emerald-300" />,
  },
  warning: {
    container: 'border-warning/30 bg-warning/10',
    icon: <AlertTriangleIcon className="size-4 text-amber-300" />,
  },
  danger: {
    container: 'border-danger/30 bg-danger/10',
    icon: <XCircleIcon className="size-4 text-red-300" />,
  },
};

export function Alert({
  tone = 'info',
  title,
  description,
  action,
  className,
  ...props
}: AlertProps) {
  const config = toneStyles[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-lg border p-4', config.container, className)}
      {...props}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
