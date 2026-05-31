import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, Check, X, Coffee, Sparkles } from 'lucide-react';
import { THEME } from '../types';

interface NotificationOnboardingProps {
  onPermissionRequested: () => Promise<boolean>;
  activeOrderId: string | null;
}

export const NotificationOnboarding: React.FC<NotificationOnboardingProps> = ({ 
  onPermissionRequested,
  activeOrderId
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show if the user has an active order and hasn't made a choice in this session
    if (activeOrderId && typeof window !== 'undefined' && 'Notification' in window) {
      const permissionChoice = localStorage.getItem('avin_push_onboarding_shown');
      const isDefault = Notification.permission === 'default';

      if (isDefault && !permissionChoice) {
        // Show onboarding modal after a 2-second delay for smooth onboarding
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [activeOrderId]);

  const handleAccept = async () => {
    localStorage.setItem('avin_push_onboarding_shown', 'accepted');
    setIsOpen(false);
    await onPermissionRequested();
  };

  const handleDecline = () => {
    localStorage.setItem('avin_push_onboarding_shown', 'declined');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDecline}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="relative bg-white text-black w-full max-w-md rounded-[40px] p-8 md:p-10 shadow-2xl border-2 border-[#C2A382]/20 overflow-hidden"
          >
            {/* Top gold abstract shape */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#C2A382]" />

            {/* Glowing Bell Icon */}
            <div className="relative w-20 h-20 bg-[#C2A382]/10 rounded-full flex items-center justify-center text-[#C2A382] mx-auto mb-6 border border-[#C2A382]/20">
              <BellRing size={36} className="animate-bounce" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#2D241E] text-white rounded-full flex items-center justify-center">
                <Sparkles size={12} className="text-[#C2A382]" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-black text-center uppercase tracking-tight text-[#1A1A1A]">
              Ειδοποιήσεις Παραγγελίας
            </h3>
            <p className="text-center text-sm font-bold text-[#C2A382] uppercase tracking-widest mt-1 mb-4">
              Μάθετε αμέσως πότε είναι έτοιμος!
            </p>
            <p className="text-center text-sm text-[#1A1A1A]/70 font-light leading-relaxed mb-8">
              Επιτρέψτε μας να σας στείλουμε μια σύντομη native ειδοποίηση τη στιγμή που ο barista ολοκληρώσει την προετοιμασία του καφέ σας. 
              <br />
              <span className="font-bold text-[#1A1A1A]">Λειτουργεί ακόμα και με κλειστή την εφαρμογή!</span>
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAccept}
                className="w-full bg-[#2D241E] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg active:scale-[0.98]"
              >
                <Check size={16} />
                ΕΝΕΡΓΟΠΟΙΗΣΗ ΕΙΔΟΠΟΙΗΣΕΩΝ
              </button>
              <button
                onClick={handleDecline}
                className="w-full border border-black/10 text-black/50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/5 transition-colors active:scale-[0.98]"
              >
                <X size={16} />
                ΟΧΙ ΤΩΡΑ
              </button>
            </div>

            {/* Note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black text-black/30">
              <Coffee size={12} />
              <span>AVIN ΣΟΛΟΜΟΣ COFFEE EXPERIENCE</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
