import React from 'react';
import { cx } from '../lib/cx';
import { InboxIcon } from './Icons';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-subtle bg-panel/60 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-3 flex size-11 items-center justify-center rounded-lg border border-subtle bg-elevated text-ink-muted [&_svg]:size-5">
        {icon ?? <InboxIcon />}
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
