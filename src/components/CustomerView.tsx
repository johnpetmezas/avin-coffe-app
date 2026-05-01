import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './Header';
import { PRODUCTS, TEXT, OrderItem, Product, Order } from '../types';
import { SugarModal } from './SugarModal';
import { Plus, Coffee, Trash2, ChevronUp, ChevronDown, User, ShoppingBag, Check } from 'lucide-react';
import { OrderTracking } from './OrderTracking';
import { ProfileView } from './ProfileView';

interface CustomerViewProps {
  onPlaceOrder: (items: any[], arrivalTime: string, notes: string) => void;
  activeOrder: Order | null;
  history: Order[];
  onCancelOrder: (id: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ onPlaceOrder, activeOrder, history, onCancelOrder }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'profile'>('menu');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [arrivalTime, setArrivalTime] = useState('10 λεπτά');
  const [notes, setNotes] = useState('');
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastArrivalTime, setLastArrivalTime] = useState('');

  const handleAddProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const onSugarSubmit = (sugar: string) => {
    if (selectedProduct) {
      setCart(prev => {
        const existingIndex = prev.findIndex(item => item.id === selectedProduct.id && item.sugar === sugar);
        if (existingIndex > -1) {
          const newCart = [...prev];
          newCart[existingIndex].quantity += 1;
          return newCart;
        }
        return [...prev, { ...selectedProduct, sugar, quantity: 1 }];
      });
      setSelectedProduct(null);
    }
  };

  const removeFromCart = (id: string, sugar: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.sugar === sugar)));
    if (cart.length === 1) setIsCartExpanded(false);
  };

  const updateQuantity = (id: string, sugar: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.sugar === sugar) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      <main className="p-6">
        <div className="flex items-center justify-between mb-8 mt-2">
          <h1 className="text-3xl font-black text-brand-black">
            {activeTab === 'menu' ? 'Κατάλογος' : 'Προφίλ'}
          </h1>
          <button 
            onClick={() => setActiveTab(activeTab === 'menu' ? 'profile' : 'menu')}
            className={`p-3 rounded-2xl transition-colors ${
              activeTab === 'profile' ? 'bg-brand-brown text-white' : 'bg-brand-black/5 text-brand-black'
            }`}
          >
            <User size={20} />
          </button>
        </div>

        {activeTab === 'menu' ? (
          <div className="flex flex-col gap-8 pb-40">
            <div className="grid gap-4">
              {PRODUCTS.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className="bg-white border border-brand-black/5 rounded-[32px] p-5 flex items-center justify-between group relative overflow-hidden active:bg-brand-black/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-black/5 rounded-2xl flex items-center justify-center text-brand-black/40 group-hover:text-brand-brown transition-colors">
                      <Coffee size={24} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-black text-brand-black text-sm">{product.name}</h3>
                      <span className="text-brand-brown font-black text-xs">€{(product.price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    className="bg-brand-black text-white w-10 h-10 rounded-xl flex items-center justify-center active:bg-brand-black/80 transition-colors"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-brand-black/30 mb-4">{TEXT.notes}</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="(Π.Χ. ΖΑΧΑΡΗ, ΓΑΛΑ)"
                className="w-full bg-brand-black/5 border-none rounded-[32px] p-6 text-sm focus:ring-1 focus:ring-brand-brown/40 min-h-[120px] outline-none transition-all placeholder:text-brand-black/20"
              />
            </div>

            <div>
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-brand-black/30 mb-4">{TEXT.timeTitle}</h3>
              <div className="grid grid-cols-2 gap-3">
                {['5 λεπτά', '10 λεπτά', '15 λεπτά', '20+ λεπτά'].map(time => (
                  <button
                    key={time}
                    onClick={() => setArrivalTime(time)}
                    className={`py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-colors ${
                      arrivalTime === time 
                        ? 'bg-brand-black text-white' 
                        : 'bg-white border border-brand-black/10 text-brand-black/50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ProfileView 
              activeOrder={activeOrder} 
              history={history}
              onTrackOrder={() => setShowTracking(true)}
            />
            {!showTracking && (
              <div className="flex justify-center pb-10">
                <button 
                  onClick={() => setActiveTab('menu')}
                  className="bg-brand-black text-white px-8 py-4 rounded-[32px] flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] active:bg-brand-black/90 transition-colors"
                >
                  <ShoppingBag size={18} />
                  Επιστροφη στον Καταλογο
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Bottom Sheet */}
      {activeTab === 'menu' && (
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className={`fixed bottom-0 left-0 right-0 z-50 bg-brand-black text-white shadow-2xl rounded-t-[48px] px-8 pb-10 transition-all duration-500 ease-out ${isCartExpanded ? 'max-h-[85vh]' : 'max-h-[160px]'}`}
            >
              <div className="flex flex-col h-full">
                <div 
                  className="w-full flex justify-center py-6 cursor-pointer group"
                  onClick={() => setIsCartExpanded(!isCartExpanded)}
                >
                  <div className="w-12 h-1 bg-white/10 rounded-full" />
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{TEXT.total}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">€{(totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-brown text-white rounded-2xl flex items-center justify-center font-black">
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </div>
                    <button 
                      onClick={() => setIsCartExpanded(!isCartExpanded)}
                      className="p-3 bg-white/5 rounded-2xl text-white/50"
                    >
                      {isCartExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </button>
                  </div>
                </div>

                {isCartExpanded && (
                  <div className="flex-1 overflow-y-auto py-4 space-y-6 mb-8 custom-scrollbar">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.sugar}`} className="flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="font-black text-sm">{item.name}</span>
                          <span className="text-[10px] text-brand-brown font-black uppercase tracking-widest">{item.sugar}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-white/5 rounded-2xl p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.sugar, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                            >-</button>
                            <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.sugar, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                            >+</button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id, item.sugar)}
                            className="text-red-500 p-2 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    onPlaceOrder(cart, arrivalTime, notes);
                    setLastArrivalTime(arrivalTime);
                    setCart([]);
                    setNotes('');
                    setIsCartExpanded(false);
                    setShowSuccess(true);
                  }}
                  className="w-full bg-brand-brown text-white py-4 rounded-[22px] font-black text-base active:bg-brand-brown/90 transition-colors uppercase tracking-tight"
                >
                  {TEXT.cta}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}


      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 text-center max-w-[320px] w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-brown/5 rounded-full -mr-16 -mt-16" />
              
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center relative">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-green-500 shadow-sm">
                    <Check size={20} className="text-green-500" strokeWidth={4} />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-black text-brand-black mb-6">Η παραγγελία ελήφθη!</h2>
              
              <div className="bg-brand-black/5 rounded-[24px] p-6 mb-6">
                <p className="text-[10px] text-brand-black/60 font-bold uppercase tracking-widest mb-2">Ο καφές σας θα είναι έτοιμος σε</p>
                <p className="text-xl font-black text-brand-brown">{lastArrivalTime}</p>
              </div>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-brand-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:bg-brand-black/80 transition-colors"
              >
                ΚΛΕΙΣΙΜΟ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTracking && activeOrder && (
          <OrderTracking 
            order={activeOrder} 
            onCancel={onCancelOrder}
            onClose={() => setShowTracking(false)}
          />
        )}
      </AnimatePresence>

      <SugarModal
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onSubmit={onSugarSubmit}
      />
    </div>
  );
};
