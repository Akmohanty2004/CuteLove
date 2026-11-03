import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import confetti from 'canvas-confetti';

export const LoveReactions = () => {
  const { incomingReaction, clearIncomingReaction } = useSocket();

  useEffect(() => {
    if (incomingReaction) {
      // Fire confetti hearts on screen
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#f43f5e', '#ec4899', '#fbcfe8', '#fb7185'],
      });

      const timer = setTimeout(() => {
        clearIncomingReaction();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [incomingReaction]);

  if (!incomingReaction) return null;

  const reactionEmojis = {
    hug: '🤗',
    kiss: '💋',
    heart: '💖',
    sparkle: '✨',
  };

  const emoji = reactionEmojis[incomingReaction.type] || '❤️';

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="relative glass-modal rounded-3xl p-4 sm:p-5 shadow-2xl border border-rose-300 flex items-center gap-4 max-w-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-rose-500/30 animate-heartbeat">
            {emoji}
          </div>

          <div className="flex-1 pr-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Incoming Love</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">
              {incomingReaction.from} sent you a {incomingReaction.type}!
            </h4>
            {incomingReaction.note && (
              <p className="text-xs text-slate-500 italic mt-0.5">
                "{incomingReaction.note}"
              </p>
            )}
          </div>

          <button
            onClick={clearIncomingReaction}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
