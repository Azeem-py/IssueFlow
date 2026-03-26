import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export function PushNotificationManager() {
  const { isSupported, permission, subscription, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  if (loading) {
    return (
      <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
        Checking push config...
      </div>
    );
  }

  if (subscription) {
    return (
      <div className="px-3 py-2 flex items-center justify-between bg-primary/5 rounded-lg border border-primary/10 mt-2">
         <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">notifications_active</span>
            Push Enabled
         </div>
         <button 
           onClick={() => unsubscribe()}
           className="text-[10px] text-slate-400 hover:text-rose-500 uppercase tracking-widest font-bold transition-colors"
         >
           Disable
         </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="px-3 py-2 text-xs text-rose-500 flex items-center gap-2 mt-2">
         <span className="material-symbols-outlined text-sm">notifications_off</span>
         Push Notifications Blocked
      </div>
    );
  }

  return (
    <div className="px-3 py-2 mt-2">
      <button
        onClick={() => subscribe()}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-sm">add_alert</span>
        Enable Push Alerts
      </button>
    </div>
  );
}
