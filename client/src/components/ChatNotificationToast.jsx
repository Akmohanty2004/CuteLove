import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronRight, Heart } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export const ChatNotificationToast = () => {
  const { newChatNotification, clearNewChatNotification } = useSocket();
  const { navigateTo, currentPage, partner } = useAuth();

  useEffect(() => {
    if (newChatNotification) {
      const timer = setTimeout(() => {
        clearNewChatNotification();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [newChatNotification, clearNewChatNotification]);

  if (!newChatNotification) return null;

  const handleOpenChat = () => {
    clearNewChatNotification();
    if (currentPage !== 'whatsapp') {
      navigateTo('whatsapp');
    }
  };

  const senderName = newChatNotification.senderName || partner?.displayName || 'Partner';

  return (
    <AnimatePresence>
      <div className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[1000] w-[94%] max-w-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.92 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={handleOpenChat}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900/95 text-white border-2 border-rose-500/50 backdrop-blur-2xl shadow-[0_12px_40px_rgba(244,63,94,0.35)] p-3.5 sm:p-4 flex items-center gap-3.5 cursor-pointer group hover:border-rose-400 transition-all select-none"
        >
          {/* Subtle animated stardust glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/25 via-pink-500/10 to-transparent rounded-full pointer-events-none" />

          {/* Left Avatar / WhatsApp Icon Badge */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white flex items-center justify-center font-bold font-serif text-lg shadow-md border-2 border-white/30">
              {senderName.charAt(0)}
            </div>
            {/* WhatsApp Green Icon Badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm border border-slate-900">
              <MessageCircle className="w-3 h-3 fill-white text-white" />
            </div>
          </div>

          {/* Message Preview Body */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-xs sm:text-sm text-white truncate">
                  {senderName}
                </span>
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400 shrink-0" />
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Just now</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-rose-100/90 font-medium truncate">
              {newChatNotification.text || 'Sent you a romantic message 💕'}
            </p>
          </div>

          {/* Reply Action Chip */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden xs:flex items-center gap-1 text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1.5 rounded-xl shadow-xs transition-colors">
              <span>Open</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>

            {/* Dismiss X button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearNewChatNotification();
              }}
              title="Dismiss notification"
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
