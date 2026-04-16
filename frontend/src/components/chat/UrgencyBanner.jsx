import React from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UrgencyBanner = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-red-500/10 backdrop-blur-md border border-red-500/30 text-[var(--text-base)] p-4 rounded-xl shadow-lg relative my-4 animate-pulse-ring mx-4 md:mx-auto max-w-2xl"
        >
          <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:bg-black/20 rounded-full transition-colors">
            <X className="w-4 h-4 text-red-500" />
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-red-500 font-bold mb-1">Immediate Assistance Required</h4>
              <p className="text-sm opacity-90">This situation seems urgent. Please reach out to emergency services immediately.</p>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <a href="tel:100" className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors">
                <PhoneCall className="w-4 h-4" /> Call 100 (Police)
              </a>
              <a href="tel:181" className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-500 rounded-lg text-sm font-bold transition-colors">
                <PhoneCall className="w-4 h-4" /> Call 181 (Women Helpline)
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
