import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Order, OrderItem } from '../types';

const STORAGE_KEY = 'avin_orders';
const ACTIVE_KEY = 'avin_active_order';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage<Order[]>(STORAGE_KEY, []));
  const [activeOrder, setActiveOrder] = useState<Order | null>(() =>
    loadFromStorage<Order | null>(ACTIVE_KEY, null)
  );
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Initialize anonymous auth
  useEffect(() => {
    // Check if Firebase config is dummy or real
    const isRealFirebase = import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                           !import.meta.env.VITE_FIREBASE_PROJECT_ID.includes('dummy');

    if (!isRealFirebase) {
      console.log('Firebase config is using dummy values. Falling back to local storage.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsFirebaseReady(true);
        setLoading(false);
      } else {
        try {
          const credentials = await signInAnonymously(auth);
          setUserId(credentials.user.uid);
          setIsFirebaseReady(true);
          setLoading(false);
        } catch (error) {
          console.error('Anonymous auth failed, using local storage:', error);
          setIsFirebaseReady(false);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Listeners
  useEffect(() => {
    if (!isFirebaseReady || !db) return;

    // Listen to orders collection ordered by creation time
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbOrders: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        dbOrders.push({
          id: doc.id,
          items: data.items,
          customerName: data.customerName || 'Customer',
          arrivalTime: data.arrivalTime,
          targetTimestamp: data.targetTimestamp,
          notes: data.notes,
          createdAt: data.createdAt,
          status: data.status,
          total: data.total,
          userId: data.userId,
          pushSubscription: data.pushSubscription
        } as Order);
      });
      
      setOrders(dbOrders);

      // Sync active order if it is in the updated orders list
      if (activeOrder) {
        const updatedActive = dbOrders.find(o => o.id === activeOrder.id);
        if (updatedActive) {
          setActiveOrder(updatedActive);
        }
      }
    }, (error) => {
      console.error('Firestore subscription error, using local storage state:', error);
    });

    return () => unsubscribe();
  }, [isFirebaseReady, activeOrder?.id]);

  // 3. Sync to localStorage for offline / fallback
  useEffect(() => {
    saveToStorage(STORAGE_KEY, orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage(ACTIVE_KEY, activeOrder);
  }, [activeOrder]);

  // 4. Actions
  const addOrder = async (items: OrderItem[], arrivalTime: string, notes: string) => {
    const timeMap: Record<string, number> = {
      '5 λεπτά': 5,
      '10 λεπτά': 10,
      '15 λεπτά': 15,
      '20+ λεπτά': 20,
    };
    const minutes = timeMap[arrivalTime] ?? 10;
    const now = Date.now();
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderId = Math.random().toString(36).substring(2, 11);
    const newOrder: Order = {
      id: orderId,
      items,
      customerName: 'Mobile User',
      arrivalTime,
      targetTimestamp: now + minutes * 60 * 1000,
      notes,
      createdAt: now,
      status: 'pending_grace_period',
      total,
      userId: userId || 'local-user'
    };

    // Update local state immediately for instant feedback
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Save to Firestore if available
    if (isFirebaseReady && db) {
      try {
        await setDoc(doc(db, 'orders', orderId), {
          ...newOrder,
          createdAt: now,
          targetTimestamp: now + minutes * 60 * 1000,
        });
      } catch (error) {
        console.error('Failed to save order to Firestore:', error);
      }
    }
  };

  const editOrder = async (id: string, updatedItems: OrderItem[], arrivalTime: string, notes: string) => {
    const timeMap: Record<string, number> = {
      '5 λεπτά': 5,
      '10 λεπτά': 10,
      '15 λεπτά': 15,
      '20+ λεπτά': 20,
    };
    const minutes = timeMap[arrivalTime] ?? 10;
    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const patch = {
      items: updatedItems,
      arrivalTime,
      notes,
      total,
      targetTimestamp: Date.now() + minutes * 60 * 1000,
    };

    // Update locally
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
    setActiveOrder(prev => prev && prev.id === id ? { ...prev, ...patch } : prev);

    // Update Firestore
    if (isFirebaseReady && db) {
      try {
        await updateDoc(doc(db, 'orders', id), patch);
      } catch (error) {
        console.error('Failed to edit order in Firestore:', error);
      }
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    // Update locally
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (activeOrder?.id === id) {
      setActiveOrder(prev => prev ? { ...prev, status } : null);
    }

    // Update Firestore
    if (isFirebaseReady && db) {
      try {
        await updateDoc(doc(db, 'orders', id), { status });
      } catch (error) {
        console.error('Failed to update order status in Firestore:', error);
      }
    }
  };

  const cancelOrder = async (id: string) => {
    // Update locally
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    if (activeOrder?.id === id) {
      setActiveOrder(null);
    }

    // Update Firestore
    if (isFirebaseReady && db) {
      try {
        await updateDoc(doc(db, 'orders', id), { status: 'cancelled' });
      } catch (error) {
        console.error('Failed to cancel order in Firestore:', error);
      }
    }
  };

  const deleteOrder = async (id: string) => {
    // Update locally
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return {
    orders,
    activeOrder,
    loading,
    addOrder,
    editOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    isFirebaseReady,
    userId
  };
};
