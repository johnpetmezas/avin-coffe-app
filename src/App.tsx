import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CustomerView } from './components/CustomerView';
import { StaffDashboard } from './components/StaffDashboard';
import { Order, OrderItem } from './types';

const API_BASE = 'https://your-vercel-domain.vercel.app/api';
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

export default function App() {
  const [view, setView] = useState<'customer' | 'staff'>('customer');
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage<Order[]>(STORAGE_KEY, []));
  const [activeOrder, setActiveOrder] = useState<Order | null>(() =>
    loadFromStorage<Order | null>(ACTIVE_KEY, null)
  );

  // Persist orders to localStorage on every change
  useEffect(() => {
    saveToStorage(STORAGE_KEY, orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage(ACTIVE_KEY, activeOrder);
  }, [activeOrder]);

  // Grace period timer: move pending_grace_period → received after 30s
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const GRACE = 30_000;
      setOrders(prev => {
        let changed = false;
        const updated = prev.map(o => {
          if (o.status === 'pending_grace_period' && now - o.createdAt >= GRACE) {
            changed = true;
            return { ...o, status: 'received' as const };
          }
          return o;
        });
        if (!changed) return prev;
        return updated;
      });
      // Also sync activeOrder status
      setActiveOrder(prev => {
        if (prev && prev.status === 'pending_grace_period' && now - prev.createdAt >= GRACE) {
          return { ...prev, status: 'received' };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Try to sync from real backend (non-blocking, optional)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/staff`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(data.orders);
          }
        }
      } catch {
        // Backend not reachable — local state takes over
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 10_000);
    return () => clearInterval(interval);
  }, []);

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

    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 11),
      items,
      customerName: 'Mobile User',
      arrivalTime,
      targetTimestamp: now + minutes * 60 * 1000,
      notes,
      createdAt: now,
      status: 'pending_grace_period',
      total,
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Fire-and-forget to backend
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, arrivalTime, notes, customerName: 'Mobile User' }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update id from backend if available
        if (data.orderId) {
          setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, id: data.orderId } : o));
          setActiveOrder(prev => prev && prev.id === newOrder.id ? { ...prev, id: data.orderId } : prev);
        }
      }
    } catch { /* local only */ }
  };

  const editOrder = (id: string, updatedItems: OrderItem[], arrivalTime: string, notes: string) => {
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

    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
    setActiveOrder(prev => prev && prev.id === id ? { ...prev, ...patch } : prev);
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (activeOrder?.id === id) setActiveOrder(prev => prev ? { ...prev, status } : null);

    try {
      await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: status === 'preparing' ? 'confirm' : status }),
      });
    } catch { /* local only */ }
  };

  const cancelOrder = async (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    if (activeOrder?.id === id) setActiveOrder(null);

    try {
      await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
    } catch { /* local only */ }
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const history = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="relative min-h-screen">
      {/* View switcher */}
      <div className="view-switcher">
        <button
          onClick={() => setView('customer')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            view === 'customer' ? 'bg-brand-black text-white shadow-lg' : 'bg-white text-brand-black border border-brand-black/10'
          }`}
        >
          App View
        </button>
        <button
          onClick={() => setView('staff')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            view === 'staff' ? 'bg-brand-black text-white shadow-lg' : 'bg-white text-brand-black border border-brand-black/10'
          }`}
        >
          Staff View
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'customer' ? (
          <motion.div key="customer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CustomerView
              onPlaceOrder={addOrder}
              onEditOrder={editOrder}
              activeOrder={activeOrder}
              history={history}
              onCancelOrder={cancelOrder}
              onDeleteOrder={deleteOrder}
            />
          </motion.div>
        ) : (
          <motion.div key="staff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StaffDashboard
              orders={orders}
              onComplete={(id) => updateOrderStatus(id, 'completed')}
              onUpdateStatus={updateOrderStatus}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
