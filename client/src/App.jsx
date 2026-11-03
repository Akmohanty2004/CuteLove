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
        currentPage === 'whatsapp' ? (
          <WhatsAppChatPage onBack={() => navigateTo('dashboard')} />
        ) : (
          <DashboardPage onOpenWhatsApp={() => navigateTo('whatsapp')} />
        )
      ) : (
        <LoginPage />
      )}
    </div>
  );
};

export default App;
