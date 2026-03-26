import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  
  const { user, currentOrg } = useAuth();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check for existing subscription
      navigator.serviceWorker.ready.then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const subscribe = async () => {
    try {
      setLoading(true);
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Permission not granted for Notification');
      }

      const registration = await navigator.serviceWorker.ready;
      
      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error('VAPID public key not found in environment');
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      setSubscription(sub);

      // Send to backend
      if (user && currentOrg) {
        await api.post('/notifications/push/subscribe', sub.toJSON(), {
          headers: { 'x-org-id': currentOrg.id }
        });
      }

      return sub;
    } catch (err) {
      console.error('Failed to subscribe to push notifications', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setLoading(true);
      if (subscription) {
        // Remove from backend
        if (user && currentOrg) {
          await api.delete('/notifications/push/unsubscribe', {
            data: { endpoint: subscription.endpoint },
            headers: { 'x-org-id': currentOrg.id }
          });
        }
        
        // Remove from browser
        await subscription.unsubscribe();
        setSubscription(null);
      }
    } catch (err) {
      console.error('Failed to unsubscribe from push notifications', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    loading,
    subscribe,
    unsubscribe
  };
}
