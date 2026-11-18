import React from 'react';
import { cx } from '../lib/cx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    interactive = false,
    selected = false,
    className,
    onClick,
    onKeyDown,
    tabIndex,
    ...props
  },
  ref,
) {
  const clickable = interactive && Boolean(onClick);

  return (
    <div
      ref={ref}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? tabIndex ?? 0 : tabIndex}
      onClick={onClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (clickable && !event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
      className={cx(
        'rounded-xl border border-subtle bg-panel shadow-elevation-1',
        interactive &&
          'cursor-pointer transition-[border-color,background-color,box-shadow] duration-150 hover:border-line hover:bg-elevated/60 hover:shadow-elevation-2',
        clickable &&
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        selected && 'border-brand-500/60 bg-selected/40 ring-1 ring-brand-500/20',
        className,
      )}
      {...props}
    />
  );
});

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('flex flex-col gap-1 p-5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cx('text-sm font-semibold tracking-tight text-ink', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx('text-xs leading-relaxed text-ink-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('px-5 py-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('flex items-center gap-2 border-t border-subtle px-5 py-3', className)} {...props} />;
}
