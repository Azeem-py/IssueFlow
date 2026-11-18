import React from 'react';
import { cx } from '../lib/cx';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  statusLabel?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
};

const statusStyles: Record<AvatarStatus, string> = {
  online: 'bg-success',
  away: 'bg-warning',
  busy: 'bg-danger',
  offline: 'bg-slate-500',
};

function initials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({
  src,
  name,
  alt,
  size = 'md',
  status,
  statusLabel,
  className,
  ...props
}: AvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !imageFailed;

  return (
    <span
      className={cx('relative inline-flex shrink-0', sizeStyles[size], className)}
      {...props}
    >
      <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-brand-500/15 font-semibold text-brand-300 ring-1 ring-white/10">
        {showImage ? (
          <img
            src={src ?? undefined}
            alt={alt ?? name ?? ''}
            className="size-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-hidden="true">{initials(name)}</span>
        )}
        {!showImage && name && <span className="sr-only">{name}</span>}
      </span>

      {status && (
        <span
          className={cx(
            'absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-panel',
            statusStyles[status],
            size === 'xs' || size === 'sm' ? 'size-2' : 'size-2.5',
          )}
        >
          <span className="sr-only">{statusLabel ?? `Status: ${status}`}</span>
        </span>
      )}
    </span>
  );
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
  label?: string;
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'sm',
  className,
  label = 'Team members',
}: AvatarGroupProps) {
  const items = React.Children.toArray(children);
  const visible = items.slice(0, max);
  const extra = items.length - visible.length;

  return (
    <div className={cx('flex items-center -space-x-2', className)} role="group" aria-label={label}>
      {visible.map((child, index) => (
        <span key={React.isValidElement(child) ? child.key ?? index : index} className="rounded-full ring-2 ring-panel">
          {child}
        </span>
      ))}
      {extra > 0 && (
        <span
          className={cx(
            'inline-flex items-center justify-center rounded-full border border-subtle bg-elevated font-semibold text-ink-muted ring-2 ring-panel',
            sizeStyles[size],
          )}
          aria-label={`${extra} more ${extra === 1 ? 'person' : 'people'}`}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
