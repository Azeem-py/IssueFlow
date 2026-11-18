import React from 'react';
import { cx } from '../lib/cx';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

type TooltipChildProps = React.HTMLAttributes<HTMLElement> & {
  'aria-describedby'?: string;
};

export interface TooltipProps {
  label: string;
  children: React.ReactElement<TooltipChildProps>;
  side?: TooltipSide;
  className?: string;
}

const sideStyles: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const childProps = children.props;

  const child = React.cloneElement(children, {
    'aria-describedby': open ? id : childProps['aria-describedby'],
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(event);
      setOpen(true);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(event);
      setOpen(false);
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      setOpen(true);
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      setOpen(false);
    },
  });

  return (
    <span className={cx('relative inline-flex', className)}>
      {child}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cx(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-line bg-elevated px-2 py-1 text-[11px] font-medium text-ink shadow-elevation-2',
            sideStyles[side],
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
