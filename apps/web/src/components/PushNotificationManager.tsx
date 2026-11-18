import React from 'react';
import { BellIcon, Spinner } from '@issueflow/ui';
import { usePushNotifications } from '../hooks/usePushNotifications';

export function PushNotificationManager() {
  const { isSupported, permission, subscription, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[11.5px] text-ink-muted">
        <Spinner className="size-3.5" />
        Checking push alerts…
      </div>
    );
  }

  if (subscription) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-subtle bg-panel px-2.5 py-2">
        <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-ink-secondary">
          <BellIcon className="size-3.5 shrink-0 text-brand-400" />
          <span className="truncate">Push alerts on</span>
        </span>
        <button
          type="button"
          onClick={() => unsubscribe()}
          className="shrink-0 text-[10.5px] font-medium text-ink-disabled transition-colors hover:text-red-300"
        >
          Disable
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[11.5px] text-ink-disabled">
        <BellIcon className="size-3.5" />
        Push alerts blocked in browser
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => subscribe()}
      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-subtle bg-panel px-2.5 py-2 text-[11.5px] font-medium text-ink-muted transition-colors hover:border-line hover:bg-hover hover:text-ink"
    >
      <BellIcon className="size-3.5" />
      Enable push alerts
    </button>
  );
}
