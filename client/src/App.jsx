import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WhatsAppChatPage } from './pages/WhatsAppChatPage';
import { useAuth } from './context/AuthContext';
import { Heart } from 'lucide-react';

export const App = () => {
  const { user, isLoading, currentPage, navigateTo } = useAuth();
  // App opens with animated welcome overlay every time as requested
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="relative min-h-screen bg-rose-50/30">
      {/* Full-Screen Animated Welcome Overlay with AnimatePresence */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeScreen onComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {/* Main App Content revealed after welcome */}
      {isLoading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50/40">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 animate-heartbeat">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <p className="mt-4 text-xs font-serif italic text-rose-600">
            Checking 30-day session for Ashis &amp; Kirti...
          </p>
        </div>
      ) : user ? (
        <AnimatePresence mode="wait" initial={false}>
          {currentPage === 'whatsapp' ? (
            <motion.div
              key="whatsapp-fullscreen-page"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 w-full h-[100dvh]"
            >
              <WhatsAppChatPage onBack={() => navigateTo('dashboard')} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-sanctuary-page"
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DashboardPage onOpenWhatsApp={() => navigateTo('whatsapp')} />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <LoginPage />
      )}
    </div>
  );
};

export default App;
