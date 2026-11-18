import React from 'react';
import { Badge, type BadgeTone } from './Badge';

const priorityConfig: Record<string, { label: string; tone: BadgeTone }> = {
  LOW: { label: 'Low', tone: 'neutral' },
  MEDIUM: { label: 'Medium', tone: 'warning' },
  HIGH: { label: 'High', tone: 'orange' },
  URGENT: { label: 'Urgent', tone: 'danger' },
};

function humanize(value: string) {
  const words = value.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface PriorityBadgeProps {
  priority: string;
  label?: string;
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function PriorityBadge({
  priority,
  label,
  variant = 'subtle',
  size = 'sm',
  dot = true,
  className,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority.toUpperCase()];

  return (
    <Badge
      tone={config?.tone ?? 'neutral'}
      variant={variant}
      size={size}
      dot={dot}
      className={className}
    >
      {label ?? config?.label ?? humanize(priority)}
    </Badge>
  );
}
