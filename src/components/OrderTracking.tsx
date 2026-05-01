import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Clock, Package, Coffee, XCircle, ChevronLeft, RotateCcw } from 'lucide-react';
import { Order, TEXT } from '../types';

interface OrderTrackingProps {
  order: Order;
  onCancel: (id: string) => void;
  onClose: () => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onCancel, onClose }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(4);
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    if (order.status === 'ready' && !audioPlayed) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
      setAudioPlayed(true);
    }
  }, [order.status, audioPlayed]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCancelling && cancelCountdown > 0) {
      timer = setInterval(() => {
        setCancelCountdown(prev => prev - 1);
      }, 1000);
    } else if (isCancelling && cancelCountdown === 0) {
      onCancel(order.id);
      onClose();
    }
    return () => clearInterval(timer);
  }, [isCancelling, cancelCountdown, order.id, onCancel, onClose]);

  const handleStartCancel = () => {
    setIsCancelling(true);
    setCancelCountdown(4);
  };

  const handleUndoCancel = () => {
    setIsCancelling(false);
    setCancelCountdown(4);
  };

  const steps = [
    { key: 'received', label: 'Λήφθηκε', icon: Clock },
    { key: 'preparing', label: 'Λήφθηκε - Ετοιμάζεται', icon: Coffee },
    { key: 'ready', label: 'Έτοιμος για Παραλαβή!', icon: Check },
  ];

  const currentStepIndex = order.status === 'pending_grace_period' 
    ? 0 
    : steps.findIndex(s => s.key === order.status);
  const isReady = order.status === 'ready';

  return (
    <div className="min-h-screen bg-white fixed inset-0 z-[110] flex flex-col p-6 font-sans">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onClose}
          className="p-3 bg-brand-black/5 rounded-2xl hover:bg-brand-black/10 transition-colors"
        >
          <ChevronLeft size={20} className="text-brand-black" />
        </button>
        <span className="text-[10px] font-black text-brand-black/30 uppercase tracking-[0.2em]">#{order.id.slice(0, 8)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-brand-black mb-2">
            {isReady ? 'Ευχαριστούμε για την προτίμηση!' : 'Η Παραγγελία σας'}
          </h1>
          <p className="text-sm text-brand-black/50">
            {isReady ? 'Σας περιμένουμε στο πρατήριο AVIN - Σολομός' : 'Παρακολούθηση σε πραγματικό χρόνο'}
          </p>
        </div>

         <div className="w-full max-w-sm bg-white rounded-[40px] p-8 border border-brand-black/5 shadow-2xl shadow-brand-black/5 mb-8 relative overflow-hidden">
          {isReady && (
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16" />
          )}

          <div className="space-y-12 relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-brand-black/5 z-0" />
            
            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-center gap-6 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                    isActive ? 'bg-brand-brown text-white shadow-sm' : 'bg-brand-black/5 text-brand-black/20'
                  }`}>
                    {idx < currentStepIndex ? <Check size={20} strokeWidth={3} /> : <Icon size={20} strokeWidth={isActive ? 3 : 2} />}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={`text-sm font-black uppercase tracking-widest transition-colors duration-500 ${
                      isActive ? 'text-brand-black' : 'text-brand-black/20'
                    }`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <motion.span 
                        layoutId="active-dot"
                        className="text-[10px] font-bold text-brand-brown"
                      >
                        Ενεργό •••
                      </motion.span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isReady ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 text-center mt-4"
          >
            <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
               <Check size={40} strokeWidth={4} />
            </div>
            <div className="space-y-2">
              <p className="font-black text-brand-black text-xl">Η παραγγελία είναι έτοιμη!</p>
              <p className="text-sm text-brand-black/40 max-w-[200px]">Παρακαλώ περάστε από το ταμείο για την παραλαβή.</p>
            </div>
            
            <button
              onClick={onClose}
              className="mt-4 px-8 py-4 bg-brand-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:bg-brand-black/90 transition-colors"
            >
              Επιστροφή στο Προφίλ
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-black/5 text-brand-brown rounded-full">
               <Clock size={16} />
               <span className="text-sm font-bold">Προβλεπόμενη ώρα: {order.arrivalTime}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-8">
        <AnimatePresence>
          {(order.status === 'received' || order.status === 'pending_grace_period') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <button
                onClick={handleStartCancel}
                className="w-full py-5 rounded-3xl border border-red-500 text-red-500 bg-white font-bold active:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Ακύρωση Παραγγελίας
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancellation Overlay */}
      <AnimatePresence>
        {isCancelling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-black/20 backdrop-blur-md z-[120] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#F97373] rounded-[40px] p-10 text-center w-full max-w-[340px] shadow-2xl"
            >
              <h2 className="text-2xl font-black text-white mb-8">
                Η παραγγελία ακυρώνεται...
                <span className="block text-4xl mt-2">{cancelCountdown}</span>
              </h2>
              
              <button
                onClick={handleUndoCancel}
                className="bg-white text-[#F97373] px-10 py-5 rounded-3xl font-black flex items-center justify-center gap-3 mx-auto active:bg-white/90 transition-colors shadow-xl"
              >
                <RotateCcw size={20} strokeWidth={3} />
                Ακύρωση
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
