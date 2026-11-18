import React from 'react';
import { cx } from '../lib/cx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, rounded = 'md', ...props }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'block motion-safe:animate-pulse bg-elevated',
        rounded === 'sm' && 'rounded-sm',
        rounded === 'md' && 'rounded-md',
        rounded === 'lg' && 'rounded-lg',
        rounded === 'full' && 'rounded-full',
        className,
      )}
      {...props}
    />
  );
}
