import React from 'react';
import { cx } from '../lib/cx';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  panelId?: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  variant?: 'underline' | 'pill';
  label?: string;
  className?: string;
}

export function Tabs({
  items,
  value,
  onValueChange,
  variant = 'underline',
  label = 'Views',
  className,
}: TabsProps) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % items.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex === null) return;

    event.preventDefault();
    refs.current[nextIndex]?.focus();
    onValueChange(items[nextIndex].value);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(
        variant === 'underline'
          ? 'flex items-center gap-1 overflow-x-auto border-b border-subtle'
          : 'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-subtle bg-panel p-1',
        className,
      )}
    >
      {items.map((item, index) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`tab-${item.value}`}
            aria-selected={active}
            aria-controls={item.panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cx(
              'inline-flex shrink-0 items-center gap-2 font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
              variant === 'underline'
                ? cx(
                    '-mb-px h-10 border-b-2 px-3 text-sm',
                    active
                      ? 'border-brand-400 text-ink'
                      : 'border-transparent text-ink-muted hover:text-ink',
                  )
                : cx(
                    'h-8 rounded-md px-3 text-sm',
                    active
                      ? 'bg-elevated text-ink shadow-sm'
                      : 'text-ink-muted hover:bg-hover/60 hover:text-ink',
                  ),
            )}
          >
            {item.icon && <span className="[&_svg]:size-4">{item.icon}</span>}
            {item.label}
            {item.badge !== undefined && (
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none',
                  active ? 'bg-brand-500/15 text-brand-300' : 'bg-elevated text-ink-muted',
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
