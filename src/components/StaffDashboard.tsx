import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, TEXT, THEME } from '../types';
import { Bell, CheckCircle2, Clock, User, Coffee } from 'lucide-react';

interface StaffDashboardProps {
  orders: Order[];
  onComplete: (id: string) => void;
  onUpdateStatus: (id: string, status: Order['status']) => void;
}

const OrderCountdown = ({ target }: { target: number }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((target - Date.now()) / 1000)));

  useEffect(() => {
    const timer = setInterval(() => {
      const nextTime = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setTimeLeft(nextTime);
      if (nextTime <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 120; // Less than 2 minutes

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isUrgent && timeLeft > 0 ? 'bg-red-500 text-white' : 'bg-brand-brown/10 text-brand-brown'}`}>
      <Clock size={14} />
      <span className="text-xs font-bold font-mono">
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ orders, onComplete, onUpdateStatus }) => {
  const [bellFlashing, setBellFlashing] = useState(false);
  const activeOrders = [...orders]
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'pending_grace_period')
    .sort((a, b) => a.targetTimestamp - b.targetTimestamp);

  const [prevOrderCount, setPrevOrderCount] = useState(activeOrders.length);

  useEffect(() => {
    if (activeOrders.length > prevOrderCount) {
      // Play notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));

      setBellFlashing(true);
      const timer = setTimeout(() => setBellFlashing(false), 5000);
      return () => clearTimeout(timer);
    }
    setPrevOrderCount(activeOrders.length);
  }, [activeOrders.length, prevOrderCount]);

  return (
    <div className="min-h-screen bg-pattern p-6 pt-20 relative">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-brand-black">{TEXT.dashboard}</h1>
          <p className="text-sm text-brand-black/40 font-bold uppercase tracking-widest mt-1">Live Feed</p>
        </div>
        
        <div className={`relative p-4 rounded-2xl transition-all duration-300 ${bellFlashing ? 'bg-brand-brown lg:scale-110' : 'bg-white shadow-sm'}`}>
          <Bell className={bellFlashing ? 'text-white' : 'text-brand-brown'} />
          {activeOrders.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
              {activeOrders.length}
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {activeOrders.map((order, index) => {
            const isPriority = index < 3;
            
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 100 }}
                className={`bg-white rounded-[40px] p-8 shadow-xl shadow-brand-black/5 border-2 relative overflow-hidden transition-all duration-500 ${
                  isPriority 
                    ? 'border-brand-brown ring-4 ring-brand-brown/10' 
                    : 'border-brand-black/5'
                }`}
              >
                {isPriority && (
                  <div className="absolute top-6 -right-12 bg-brand-brown text-white text-[10px] font-black uppercase tracking-widest px-12 py-1 rotate-45 z-20 shadow-md">
                    ΠΡΟΤΕΡΑΙΟΤΗΤΑ
                  </div>
                )}

                {/* Progress bar simulation */}
              <div className="absolute top-0 left-0 h-1 bg-brand-brown/20 w-full">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 30, ease: "linear" }}
                  className="h-full bg-brand-brown"
                />
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 text-brand-black/40 mb-1">
                    <User size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{order.customerName}</span>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-brand-black/60">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">Άφιξη σε: {order.arrivalTime}</span>
                    </div>
                    <OrderCountdown target={order.targetTimestamp} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brand-black/20 font-mono">#{order.id.slice(0,4)}</span>
              </div>

              <div className="space-y-4 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1">
                       <Coffee size={20} className="text-brand-brown" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-black text-brand-black">{item.quantity}x {item.name}</span>
                      </div>
                      <span className="text-xs font-black text-brand-brown uppercase">{item.sugar}</span>
                    </div>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mb-6 p-4 bg-brand-black/5 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-brand-black/30 block mb-1">Σημειώσεις Πελάτη</span>
                  <p className="text-sm text-brand-black/70 italic leading-relaxed">
                    "{order.notes}"
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                {order.status === 'received' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'preparing')}
                    className="w-full bg-brand-brown text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:bg-brand-brown/90 transition-colors shadow-sm"
                  >
                    <Coffee size={20} />
                    ΕΝΑΡΞΗ ΠΡΟΕΤΟΙΜΑΣΙΑΣ
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'ready')}
                    className="w-full bg-green-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:bg-green-600 transition-colors shadow-sm"
                  >
                    <CheckCircle2 size={20} />
                    ΕΤΟΙΜΗ ΓΙΑ ΠΑΡΑΛΑΒΗ
                  </button>
                )}

                {order.status === 'ready' && (
                  <button
                    onClick={() => onComplete(order.id)}
                    className="w-full bg-brand-black text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:bg-brand-black/90 transition-colors shadow-sm"
                  >
                    <CheckCircle2 size={20} />
                    ΟΛΟΚΛΗΡΩΣΗ
                  </button>
                )}
              </div>
            </motion.div>
          );})}
        </AnimatePresence>

        {activeOrders.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-brand-black/20">
            <Coffee size={64} strokeWidth={1} />
            <p className="mt-4 font-bold uppercase tracking-[0.2em]">Αναμονή για παραγγελίες...</p>
          </div>
        )}
      </div>
    </div>
  );
};
