import React from 'react';
import { cx } from '../lib/cx';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cx(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-elevated px-1.5 font-mono text-[10px] font-medium leading-none text-ink-secondary shadow-elevation-1',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
