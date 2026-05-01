import React from 'react';
import { motion } from 'motion/react';
import { Clock, Check, ChevronRight, History, Package, Coffee } from 'lucide-react';
import { Order, PRODUCTS } from '../types';

interface ProfileViewProps {
  activeOrder: Order | null;
  history: Order[];
  onTrackOrder: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ activeOrder, history, onTrackOrder }) => {
  const steps = ['received', 'preparing', 'ready'];
  const currentStepIndex = activeOrder 
    ? (activeOrder.status === 'pending_grace_period' ? 0 : steps.indexOf(activeOrder.status)) 
    : -1;

  const filteredHistory = history.filter(order => order.status !== 'cancelled');

  return (
    <div className="flex flex-col gap-8 pb-24">
      {/* Active Order Card */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onTrackOrder}
          className="bg-white rounded-[40px] p-6 shadow-xl shadow-brand-black/5 border border-brand-black/5 cursor-pointer transition-colors active:bg-brand-black/5"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-black text-brand-black text-lg">Η παραγγελία σας είναι σε εξέλιξη</h3>
              <p className="text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mt-1">Άφιξη σε: {activeOrder.arrivalTime}</p>
            </div>
            <div className="w-10 h-10 bg-brand-brown/10 rounded-2xl flex items-center justify-center text-brand-brown">
              <Clock size={20} />
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-brand-black/5 z-0" />
            
            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const Icon = idx === 0 ? Clock : idx === 1 ? Coffee : Package;
              
              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                    isActive ? 'bg-brand-brown text-white shadow-md' : 'bg-brand-black/5 text-brand-black/20'
                  }`}>
                    {idx < currentStepIndex ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-brand-brown font-black text-[10px] uppercase tracking-widest">
            Πατήστε για προβολή <ChevronRight size={14} />
          </div>
        </motion.div>
      )}

      {/* Order History */}
      <div>
        <div className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-[32px] p-5 flex items-center justify-between border border-brand-black/5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-black/5 rounded-2xl flex items-center justify-center text-brand-black/40">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-black text-brand-black text-sm">
                      {new Date(order.createdAt).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[10px] font-bold text-brand-black/40 uppercase tracking-widest">
                      {order.items.length} Προϊόντα • €{(order.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {order.status === 'completed' ? 'Ολοκληρώθηκε' : 'Ακυρώθηκε'}
                </div>
              </div>
            ))
          ) : !activeOrder && (
            <div className="text-center py-12 bg-white rounded-[40px] border border-dashed border-brand-black/10">
              <Package size={32} className="mx-auto text-brand-black/10 mb-2" />
              <p className="text-brand-black/40 font-bold text-sm">Δεν υπάρχουν παραγγελίες ακόμα</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
