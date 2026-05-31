import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Helper to convert base64 VAPID key to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = (activeOrderId: string | null) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  // Update subscription in Firestore when activeOrderId changes
  useEffect(() => {
    if (activeOrderId && subscription) {
      saveSubscriptionToFirestore(activeOrderId, subscription);
    }
  }, [activeOrderId, subscription]);

  const checkExistingSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (err) {
      console.error('Error checking push subscription:', err);
    }
  };

  const saveSubscriptionToFirestore = async (orderId: string, sub: PushSubscription) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      // We store the subscription object directly (endpoint, keys)
      await updateDoc(orderRef, {
        pushSubscription: sub.toJSON()
      });
      console.log('Saved push subscription to Firestore for order:', orderId);
    } catch (err) {
      console.error('Failed to save subscription to Firestore:', err);
    }
  };

  const requestPermissionAndSubscribe = async () => {
    if (!('Notification' in window)) {
      alert('Οι ειδοποιήσεις δεν υποστηρίζονται από αυτή τη συσκευή.');
      return false;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted') {
        return await subscribeUser();
      }
      return false;
    } catch (err) {
      console.error('Error requesting permission:', err);
      return false;
    }
  };

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VITE_VAPID_PUBLIC_KEY is not defined. Push subscription skipped.');
        return false;
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      setSubscription(sub);
      setIsSubscribed(true);

      if (activeOrderId) {
        await saveSubscriptionToFirestore(activeOrderId, sub);
      }

      return true;
    } catch (err) {
      console.error('Failed to subscribe user to push notifications:', err);
      return false;
    }
  };

  const unsubscribeUser = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
      
      // Optionally clear subscription on active order
      if (activeOrderId) {
        const orderRef = doc(db, 'orders', activeOrderId);
        await updateDoc(orderRef, {
          pushSubscription: null
        });
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  };

  return {
    permission,
    isSubscribed,
    subscription,
    requestPermission: requestPermissionAndSubscribe,
    unsubscribe: unsubscribeUser
  };
};
