import React from 'react';
import { Badge, type BadgeTone } from './Badge';

const statusConfig: Record<string, { label: string; tone: BadgeTone }> = {
  BACKLOG: { label: 'Backlog', tone: 'neutral' },
  TODO: { label: 'Todo', tone: 'info' },
  IN_PROGRESS: { label: 'In progress', tone: 'teal' },
  REVIEW: { label: 'In review', tone: 'purple' },
  DONE: { label: 'Done', tone: 'success' },
  CANCELED: { label: 'Canceled', tone: 'neutral' },
  CANCELLED: { label: 'Canceled', tone: 'neutral' },
  BLOCKED: { label: 'Blocked', tone: 'danger' },
};

function humanize(value: string) {
  const words = value.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface StatusBadgeProps {
  status: string;
  label?: string;
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  variant = 'subtle',
  size = 'sm',
  dot = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status.toUpperCase()];

  return (
    <Badge
      tone={config?.tone ?? 'neutral'}
      variant={variant}
      size={size}
      dot={dot}
      className={className}
    >
      {label ?? config?.label ?? humanize(status)}
    </Badge>
  );
}
