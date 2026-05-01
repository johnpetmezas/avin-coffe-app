import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TEXT, THEME } from '../types';

interface SugarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sugar: 'Σκέτος' | 'Μέτριος' | 'Γλυκός') => void;
}

export const SugarModal: React.FC<SugarModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selected, setSelected] = useState<'Σκέτος' | 'Μέτριος' | 'Γλυκός'>('Μέτριος');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-[70] shadow-2xl"
          >
            <div className="max-w-md mx-auto">
              <div className="w-12 h-1.5 bg-brand-black/10 rounded-full mx-auto mb-8" />
              
              <h2 className="text-2xl font-black text-brand-black mb-8">{TEXT.selectionTitle}</h2>
              
              <div className="space-y-4 mb-10 text-brand-black">
                {TEXT.sugarOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelected(option)}
                    className="w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all transition-colors duration-200"
                    style={{
                      borderColor: selected === option ? THEME.brown : 'rgba(26,26,26,0.05)',
                      backgroundColor: selected === option ? 'rgba(194, 163, 130, 0.05)' : 'transparent'
                    }}
                  >
                    <span className={`text-lg font-bold ${selected === option ? 'text-brand-brown' : 'text-brand-black/60'}`}>
                      {option}
                    </span>
                    <div 
                      className="w-6 h-6 rounded-full border-2 p-1.5 flex items-center justify-center transition-all duration-200"
                      style={{ borderColor: selected === option ? THEME.brown : 'rgba(26,26,26,0.2)' }}
                    >
                      {selected === option && (
                        <div className="w-full h-full rounded-full bg-brand-brown" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => onSubmit(selected)}
                className="w-full bg-brand-brown text-white py-4 rounded-[22px] font-black text-base active:bg-brand-brown/90 transition-colors"
              >
                {TEXT.submit}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
