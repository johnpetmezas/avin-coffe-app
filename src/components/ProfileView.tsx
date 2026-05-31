import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock, Check, Package, Coffee, ChevronRight,
  RotateCcw, ChevronDown, ChevronUp,
  ShoppingBag, CheckCircle2, XCircle, Trash2
} from 'lucide-react';
import { Order, OrderItem } from '../types';

interface ProfileViewProps {
  activeOrder: Order | null;
  history: Order[];
  onTrackOrder: () => void;
  onCancelOrder: (id: string) => void;
  onEditOrder: (id: string, items: OrderItem[], arrivalTime: string, notes: string) => void;
  onDeleteOrder: (id: string) => void;
}

/* ─── Edit Order Modal ────────────────────────────────────────────── */
const SUGAR_OPTIONS = ['Σκέτος', 'Μέτριος', 'Γλυκός'] as const;
const TIME_OPTIONS = ['5 λεπτά', '10 λεπτά', '15 λεπτά', '20+ λεπτά'];

interface EditModalProps {
  order: Order;
  onClose: () => void;
  onSave: (items: OrderItem[], arrivalTime: string, notes: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ order, onClose, onSave }) => {
  const [items, setItems] = useState<OrderItem[]>(order.items.map(i => ({ ...i })));
  const [arrivalTime, setArrivalTime] = useState(order.arrivalTime);
  const [notes, setNotes] = useState(order.notes ?? '');

  const updateQty = (idx: number, delta: number) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const updateSugar = (idx: number, sugar: OrderItem['sugar']) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, sugar } : item));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const canSave = items.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-brand-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white w-full sm:max-w-md rounded-t-[40px] sm:rounded-[40px] p-6 pt-8 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-brand-black/10 rounded-full mx-auto mb-6 sm:hidden" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-brand-black">Επεξεργασία Παραγγελίας</h2>
          <button
            onClick={onClose}
            className="p-2 bg-brand-black/5 rounded-xl text-brand-black/50 hover:bg-brand-black/10 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/30 mb-3">
            Προϊόντα
          </p>
          {items.map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              layout
              className="bg-brand-black/3 border border-brand-black/8 rounded-[20px] p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-brand-black text-sm">{item.name}</p>
                  <p className="text-brand-brown text-xs font-bold">€{(item.price || 0).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeItem(idx)}
                  className="p-1.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Sugar selector */}
              <div className="flex gap-2 mb-3">
                {SUGAR_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => updateSugar(idx, s)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                      item.sugar === s
                        ? 'bg-brand-brown text-white'
                        : 'bg-brand-black/5 text-brand-black/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-black/30 uppercase tracking-widest">Ποσότητα</span>
                <div className="flex items-center gap-3 bg-brand-black/5 rounded-xl p-1">
                  <button
                    onClick={() => updateQty(idx, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm font-black text-brand-black hover:bg-brand-black hover:text-white transition-colors"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-black text-sm text-brand-black">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(idx, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm font-black text-brand-black hover:bg-brand-black hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-brand-black/20">
              <Package size={32} className="mx-auto mb-2" />
              <p className="text-sm font-bold">Δεν υπάρχουν προϊόντα</p>
            </div>
          )}

          {/* Arrival time */}
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/30 mb-3">
              Άφιξη
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setArrivalTime(t)}
                  className={`py-3 rounded-[16px] text-xs font-black uppercase tracking-widest transition-colors ${
                    arrivalTime === t
                      ? 'bg-brand-black text-white'
                      : 'bg-brand-black/5 text-brand-black/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/30 mb-3">
              Σημειώσεις
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="(Π.Χ. ΖΑΧΑΡΗ, ΓΑΛΑ)"
              className="w-full bg-brand-black/5 rounded-[20px] p-4 text-sm focus:ring-1 focus:ring-brand-brown/40 min-h-[80px] outline-none resize-none placeholder:text-brand-black/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-brand-black/5 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/30">Νέο Σύνολο</span>
            <span className="text-2xl font-black text-brand-black">€{total.toFixed(2)}</span>
          </div>
          <button
            disabled={!canSave}
            onClick={() => { onSave(items, arrivalTime, notes); onClose(); }}
            className="w-full bg-brand-brown text-white py-4 rounded-[22px] font-black text-sm uppercase tracking-tight disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Αποθήκευση Αλλαγών
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Cancellation Countdown ─────────────────────────────────────── */
interface CancelOverlayProps {
  onConfirm: () => void;
  onUndo: () => void;
  countdown: number;
}

const CancelOverlay: React.FC<CancelOverlayProps> = ({ onConfirm: _, onUndo, countdown }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[300] bg-brand-black/30 backdrop-blur-md flex items-center justify-center p-6"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-[#F97373] rounded-[40px] p-10 text-center w-full max-w-[340px] shadow-2xl"
    >
      <h2 className="text-2xl font-black text-white mb-2">Ακύρωση Παραγγελίας</h2>
      <p className="text-white/70 text-sm mb-6">Η παραγγελία ακυρώνεται σε...</p>
      <span className="block text-6xl font-black text-white mb-8">{countdown}</span>
      <button
        onClick={onUndo}
        className="bg-white text-[#F97373] px-10 py-5 rounded-3xl font-black flex items-center justify-center gap-3 mx-auto shadow-xl hover:bg-white/90 transition-colors"
      >
        <RotateCcw size={20} strokeWidth={3} />
        Αναίρεση
      </button>
    </motion.div>
  </motion.div>
);

/* ─── Status helpers ──────────────────────────────────────────────── */
const STATUS_STEPS = [
  { key: 'received',  label: 'Ελήφθη',        Icon: Clock },
  { key: 'preparing', label: 'Ετοιμάζεται',   Icon: Coffee },
  { key: 'ready',     label: 'Έτοιμος!',      Icon: CheckCircle2 },
] as const;

const statusIndex = (status: Order['status']) => {
  if (status === 'pending_grace_period') return 0;
  return STATUS_STEPS.findIndex(s => s.key === status);
};

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending_grace_period: { label: 'Αποστολή…',    classes: 'bg-yellow-100 text-yellow-700' },
  received:             { label: 'Ελήφθη',       classes: 'bg-blue-100 text-blue-700' },
  preparing:            { label: 'Ετοιμάζεται',  classes: 'bg-brand-brown/10 text-brand-brown' },
  ready:                { label: 'Έτοιμος!',     classes: 'bg-green-100 text-green-700' },
  completed:            { label: 'Ολοκληρώθηκε', classes: 'bg-green-100 text-green-700' },
  cancelled:            { label: 'Ακυρώθηκε',    classes: 'bg-red-100 text-red-500' },
};

/* ─── Order Summary Row ───────────────────────────────────────────── */
interface SummaryProps { order: Order; expandedByDefault?: boolean }

const OrderSummary: React.FC<SummaryProps> = ({ order, expandedByDefault = false }) => {
  const [open, setOpen] = useState(expandedByDefault);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/40">
          Αναλυτική Παραγγελία
        </span>
        {open ? <ChevronUp size={16} className="text-brand-black/30" /> : <ChevronDown size={16} className="text-brand-black/30" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pb-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-brand-black/3 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Coffee size={16} className="text-brand-brown flex-shrink-0" />
                    <div>
                      <p className="font-black text-brand-black text-sm">{item.quantity}× {item.name}</p>
                      <p className="text-[10px] font-bold text-brand-brown uppercase tracking-widest">{item.sugar}</p>
                    </div>
                  </div>
                  <span className="font-black text-brand-black text-sm">€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {order.notes ? (
                <div className="bg-brand-black/3 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase text-brand-black/30 mb-1">Σημειώσεις</p>
                  <p className="text-sm text-brand-black/70 italic">"{order.notes}"</p>
                </div>
              ) : null}
              <div className="flex items-center justify-between px-4 pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/30">Σύνολο</span>
                <span className="font-black text-brand-black text-base">€{(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main ProfileView ────────────────────────────────────────────── */
export const ProfileView: React.FC<ProfileViewProps> = ({
  activeOrder, history, onTrackOrder, onCancelOrder, onEditOrder, onDeleteOrder,
}) => {
  const [isCancelling, setIsCancelling]       = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(4);

  // Cancellation countdown effect
  React.useEffect(() => {
    if (!isCancelling) return;
    if (cancelCountdown <= 0) {
      if (activeOrder) onCancelOrder(activeOrder.id);
      setIsCancelling(false);
      setCancelCountdown(4);
      return;
    }
    const t = setTimeout(() => setCancelCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [isCancelling, cancelCountdown, activeOrder, onCancelOrder]);

  const startCancel = () => { setIsCancelling(true); setCancelCountdown(4); };
  const undoCancel  = () => { setIsCancelling(false); setCancelCountdown(4); };

  const curIdx    = activeOrder ? statusIndex(activeOrder.status) : -1;
  const canCancel = activeOrder && (activeOrder.status === 'pending_grace_period' || activeOrder.status === 'received');

  return (
    <div className="flex flex-col gap-6 pb-24">

      {/* ── Active Order Card ─────────────────────────────────── */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: '#ffffff' }}
          className="rounded-[40px] shadow-xl shadow-brand-black/5 border border-brand-black/5 overflow-hidden"
        >
          {/* Progress bar at top */}
          <div className="h-1 bg-brand-black/5 w-full">
            <motion.div
              className="h-full bg-brand-brown"
              initial={{ width: '0%' }}
              animate={{ width: curIdx >= 0 ? `${Math.round(((curIdx + 1) / 3) * 100)}%` : '5%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </div>

          <div className="p-6" style={{ backgroundColor: '#ffffff' }}>
            {/* Header row */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-black text-brand-black text-lg">Ενεργή Παραγγελία</h3>
                <p className="text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mt-0.5">
                  #{activeOrder.id.slice(0, 8)} · Άφιξη σε {activeOrder.arrivalTime}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_BADGE[activeOrder.status]?.classes ?? ''}`}>
                {STATUS_BADGE[activeOrder.status]?.label ?? activeOrder.status}
              </div>
            </div>

            {/* Step progress */}
            <div className="flex items-center relative mb-6">
              <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-px bg-brand-black/5 z-0" />
              <div className="flex justify-between w-full relative z-10">
                {STATUS_STEPS.map(({ key, label, Icon }, idx) => {
                  const active = idx <= curIdx;
                  const current = idx === curIdx;
                  return (
                    <div key={key} className="flex flex-col items-center gap-1.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                        active ? 'bg-brand-brown text-white' : 'bg-brand-black/5 text-brand-black/20'
                      }`}>
                        {idx < curIdx ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wide text-center transition-colors duration-500 ${
                        active ? 'text-brand-black' : 'text-brand-black/20'
                      }`}>
                        {label}
                        {current && <span className="block text-brand-brown">•••</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Accordion */}
            <div className="border-t border-brand-black/5">
              <OrderSummary order={activeOrder} expandedByDefault />
            </div>

            {/* Actions — Details button only (Edit removed) */}
            <div className="flex gap-3 mt-4 border-t border-brand-black/5 pt-4 items-center">
              <button
                onClick={onTrackOrder}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-black/90 transition-colors"
              >
                <ChevronRight size={16} />
                Λεπτομέρειες
              </button>

              {/* Circular animated cancel button */}
              {canCancel && (
                <button className="deleteButton" onClick={startCancel} title="Ακύρωση Παραγγελίας">
                  <svg className="svgIcon" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Order History ────────────────────────────────────── */}
      {history.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/30 mb-4">
            Ιστορικό Παραγγελιών
          </h3>
          <div className="space-y-3">
            {history.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                layout
                className="bg-white rounded-[32px] border border-brand-black/5 shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-black/5 rounded-2xl flex items-center justify-center text-brand-black/30">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="font-black text-brand-black text-sm">
                          {new Date(order.createdAt).toLocaleDateString('el-GR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] font-bold text-brand-black/40 uppercase tracking-widest">
                          {order.items.length} Προϊόντα · €{(order.total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_BADGE[order.status]?.classes ?? ''}`}>
                        {STATUS_BADGE[order.status]?.label ?? order.status}
                      </div>
                      {/* Delete button — only for cancelled orders */}
                      {order.status === 'cancelled' && (
                        <button
                          className="deleteButton"
                          onClick={() => onDeleteOrder(order.id)}
                          title="Διαγραφή"
                        >
                          <svg className="svgIcon" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Summary accordion per history item */}
                  <div className="border-t border-brand-black/5">
                    <OrderSummary order={order} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────── */}
      {!activeOrder && history.length === 0 && (
        <div className="text-center py-16 bg-white rounded-[40px] border border-dashed border-brand-black/10">
          <Package size={40} className="mx-auto text-brand-black/10 mb-3" />
          <p className="text-brand-black/30 font-bold text-sm">Δεν υπάρχουν παραγγελίες ακόμα</p>
        </div>
      )}

      {/* Edit Modal kept in code but not triggered (Edit button removed per request) */}

      {/* ── Cancel Overlay ───────────────────────────────────── */}
      <AnimatePresence>
        {isCancelling && (
          <CancelOverlay
            countdown={cancelCountdown}
            onConfirm={() => {}}
            onUndo={undoCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
