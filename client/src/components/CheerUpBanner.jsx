import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X, Smile, Flame } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const CheerUpBanner = () => {
  const { cheerUpAlert, dismissCheerUpAlert, emitReaction } = useSocket();
  const { partner } = useAuth();

  if (!cheerUpAlert) return null;

  const handleSendCheer = (type) => {
    emitReaction(type, `Sent with warm love to cheer you up! 💕`);
    
    // Trigger festive heart confetti on sender's screen as well
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.3 },
      colors: ['#f43f5e', '#ec4899', '#fda4af'],
    });

    // Dismiss banner after sending reaction
    setTimeout(() => {
      dismissCheerUpAlert();
    }, 1200);
  };

  const isSad = cheerUpAlert.mood === 'sad';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative my-4 overflow-hidden rounded-3xl p-5 md:p-6 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-romantic-lg"
      >
        {/* Shimmer backdrop */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          
          {/* Alert Message */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              {isSad ? '🥺' : '😤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  Mood Alert
                </span>
                <span className="text-xs text-rose-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-serif font-bold mt-1 text-white">
                {cheerUpAlert.message}
              </h4>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendCheer('hug')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-rose-600 font-bold text-xs shadow-md shadow-black/10 hover:bg-rose-50 cursor-pointer transition-all"
            >
              <span>🤗 Send a Hug</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendCheer('kiss')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-900/30 hover:bg-rose-900/40 text-white font-semibold text-xs border border-white/30 cursor-pointer transition-all"
            >
              <span>💋 Kiss</span>
            </motion.button>

            <button
              onClick={dismissCheerUpAlert}
              className="p-2 rounded-xl hover:bg-white/20 text-white/80 hover:text-white cursor-pointer transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
