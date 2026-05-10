import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CustomerView } from './components/CustomerView';
import { StaffDashboard } from './components/StaffDashboard';
import { Order, OrderItem } from './types';

const API_BASE = 'https://your-vercel-domain.vercel.app/api'; // Update with real domain

export default function App() {
  const [view, setView] = useState<'customer' | 'staff'>('customer');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Sync with real backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/staff`); // For demo, we might need a separate endpoint or auth
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const addOrder = async (items: OrderItem[], arrivalTime: string, notes: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          arrivalTime,
          notes,
          customerName: 'Mobile User'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveOrder({ id: data.orderId, status: 'pending' } as any);
      }
    } catch (err) {
      console.error('Place order failed:', err);
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    // Call the real API
    try {
      await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: status === 'preparing' ? 'confirm' : status })
      });
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => setView('customer')} className={`px-4 py-2 rounded-full text-xs font-bold ${view === 'customer' ? 'bg-brand-black text-white' : 'bg-white text-brand-black border'}`}>
          App View
        </button>
        <button onClick={() => setView('staff')} className={`px-4 py-2 rounded-full text-xs font-bold ${view === 'staff' ? 'bg-brand-black text-white' : 'bg-white text-brand-black border'}`}>
          Staff View
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'customer' ? (
          <motion.div key="customer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CustomerView 
              onPlaceOrder={addOrder} 
              activeOrder={activeOrder}
              history={orders.filter(o => o.status === 'completed')}
              onCancelOrder={cancelOrder}
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
