import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, eyebrow, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[22px] font-semibold tracking-tight text-ink md:text-[24px]">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
