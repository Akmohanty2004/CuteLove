import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from './components/WelcomeScreen';
import { EmojiSprinkler } from './components/EmojiSprinkler';
import { ChatNotificationToast } from './components/ChatNotificationToast';
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
      {/* Global Emoji Sprinkler (Hug, Kiss, Sparkle, Heart animations) */}
      <EmojiSprinkler />

      {/* Global In-App Chat Notification Toast Banner */}
      <ChatNotificationToast />

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
            Checking 30-day session for Laila &amp; Majnu...
          </p>
        </div>
      ) : user ? (
        <div className="relative min-h-screen">
          {/* Dashboard is kept persistently mounted so switching between sections or WhatsApp never flashes white */}
          <div className={currentPage === 'whatsapp' ? 'hidden' : 'block'}>
            <DashboardPage onOpenWhatsApp={() => navigateTo('whatsapp')} />
          </div>
          {currentPage === 'whatsapp' && (
            <div
              key="whatsapp-fullscreen-page"
              className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-slate-900"
            >
              <WhatsAppChatPage onBack={() => navigateTo('dashboard')} />
            </div>
          )}
        </div>
      ) : (
        <LoginPage />
      )}
    </div>
  );
};

export default App;
