/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CustomerView } from './components/CustomerView';
import { StaffDashboard } from './components/StaffDashboard';
import { Order, OrderItem } from './types';

export default function App() {
  const [view, setView] = useState<'customer' | 'staff'>('customer');
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderArrived, setNewOrderArrived] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const addOrder = (items: OrderItem[], arrivalTime: string, notes: string) => {
    // Map Greek time strings to minutes
    const timeMap: Record<string, number> = {
      '5 λεπτά': 5,
      '10 λεπτά': 10,
      '15 λεπτά': 15,
      '20+ λεπτά': 20,
    };
    const minutes = timeMap[arrivalTime] || 10;
    const now = Date.now();
    const targetTimestamp = now + minutes * 60 * 1000;

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items,
      customerName: `Customer #${Math.floor(Math.random() * 100)}`,
      arrivalTime,
      targetTimestamp,
      notes,
      createdAt: now,
      status: 'pending_grace_period',
      total
    };
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    // Notification for staff should only happen when it moves out of grace period
  };

  useEffect(() => {
    const checkGracePeriod = setInterval(() => {
      const now = Date.now();
      const GRACE_PERIOD = 30 * 1000;

      setOrders(prev => {
        let changed = false;
        const newOrders = prev.map(order => {
          if (order.status === 'pending_grace_period' && (now - order.createdAt) >= GRACE_PERIOD) {
            changed = true;
            return { ...order, status: 'received' as const };
          }
          return order;
        });

        if (changed) {
          setNewOrderArrived(true);
          setTimeout(() => setNewOrderArrived(false), 5000);
          return newOrders;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(checkGracePeriod);
  }, []);

  const completeOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' } : o));
    if (id === activeOrderId) setActiveOrderId(null);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const cancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    if (id === activeOrderId) setActiveOrderId(null);
  };

  // Toggle view for demo purposes
  const toggleView = () => setView(v => v === 'customer' ? 'staff' : 'customer');

  return (
    <div className="relative min-h-screen bg-white">
      {/* View Switcher for Demo */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setView('customer')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            view === 'customer' 
              ? 'bg-brand-black text-white shadow-lg' 
              : 'bg-white text-brand-black border border-brand-black/10'
          }`}
        >
          Customer
        </button>
        <button
          onClick={() => setView('staff')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            view === 'staff' 
              ? 'bg-brand-black text-white shadow-lg' 
              : 'bg-white text-brand-black border border-brand-black/10'
          }`}
        >
          Staff Dashboard
          {newOrderArrived && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'customer' ? (
          <motion.div
            key="customer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <CustomerView 
              onPlaceOrder={addOrder} 
              activeOrder={orders.find(o => o.id === activeOrderId && (o.status !== 'completed' && o.status !== 'cancelled')) || null}
              history={orders.filter(o => o.status === 'completed' || o.status === 'cancelled')}
              onCancelOrder={cancelOrder}
            />
          </motion.div>
        ) : (
          <motion.div
            key="staff"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StaffDashboard 
              orders={orders} 
              onComplete={completeOrder} 
              onUpdateStatus={updateOrderStatus}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
