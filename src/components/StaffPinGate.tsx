import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Delete, ArrowLeft } from 'lucide-react';
import { THEME } from '../types';

interface StaffPinGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const StaffPinGate: React.FC<StaffPinGateProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    setError(false);
    const nextPin = pin + num;
    setPin(nextPin);

    // Auto check when length reaches 4
    if (nextPin.length === 4) {
      const correctPin = import.meta.env.VITE_STAFF_PIN || '2025';
      if (nextPin === correctPin) {
        onSuccess();
      } else {
        // Trigger shake and clear
        setTimeout(() => {
          setError(true);
          setPin('');
          if ('vibrate' in navigator) navigator.vibrate(200);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 text-white"
      style={{ backgroundColor: THEME.matteBlack }}
    >
      {/* Back to App button */}
      <button
        onClick={onCancel}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Επιστροφη
      </button>

      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Header */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-10"
        >
          <div className="w-16 h-16 bg-[#C2A382]/10 rounded-full flex items-center justify-center text-[#C2A382] mx-auto mb-4 border border-[#C2A382]/20">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider">Είσοδος Προσωπικού</h2>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Εισάγετε τον 4ψήφιο κωδικό PIN</p>
        </motion.div>

        {/* PIN Indicators */}
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4 justify-center mb-12"
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  error 
                    ? 'border-red-500 bg-red-500/30' 
                    : isFilled 
                      ? 'border-[#C2A382] bg-[#C2A382]' 
                      : 'border-white/20 bg-transparent'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-xs font-bold uppercase tracking-widest -mt-6 mb-6"
            >
              ΛΑΘΟΣ ΚΩΔΙΚΟΣ PIN! ΔΟΚΙΜΑΣΤΕ ΞΑΝΑ.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full border border-white/5 bg-white/5 active:bg-[#C2A382] active:text-black hover:bg-white/10 transition-all font-mono text-xl font-bold flex items-center justify-center focus:outline-none"
            >
              {num}
            </button>
          ))}
          
          {/* Clear Key */}
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-full text-xs font-bold uppercase tracking-widest text-white/50 active:text-white transition-colors focus:outline-none flex items-center justify-center"
          >
            Clear
          </button>

          {/* 0 Key */}
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full border border-white/5 bg-white/5 active:bg-[#C2A382] active:text-black hover:bg-white/10 transition-all font-mono text-xl font-bold flex items-center justify-center focus:outline-none"
          >
            0
          </button>

          {/* Backspace Key */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full text-white/50 active:text-white transition-colors focus:outline-none flex items-center justify-center"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
