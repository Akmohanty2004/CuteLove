import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { CheerUpBanner } from '../components/CheerUpBanner';
import { AnniversaryWidget } from '../components/AnniversaryWidget';
import { MoodSelector } from '../components/MoodSelector';
import { MoodChart } from '../components/MoodChart';
import { MemoryOfTheDay } from '../components/MemoryOfTheDay';
import { DashboardFeed } from '../components/DashboardFeed';
import { MemoryVault } from '../components/MemoryVault';
import { StickyNoteWidget } from '../components/StickyNoteWidget';
import { MemoryUploader } from '../components/MemoryUploader';
import { SettingsModal } from '../components/SettingsModal';
import { LoveReactions } from '../components/LoveReactions';
import { RealisticAtmosphere } from '../components/RealisticAtmosphere';
import { RealtimeChat } from '../components/RealtimeChat';
import { RomanticMorphingGallery } from '../components/RomanticMorphingGallery';
import { useAuth } from '../context/AuthContext';
import { MOOD_THEMES } from '../utils/moodThemes';
import { Sparkles, MessageCircle } from 'lucide-react';

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'chat' | 'vault' | 'timeline' | 'notes'
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { activeMoodTheme, navigateTo } = useAuth();
  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 bg-gradient-to-br ${theme.bgGradient} selection:bg-rose-200 selection:text-rose-900 pb-16 relative overflow-x-hidden ${theme.isDark ? 'dark-theme' : ''}`}>
      
      {/* Dynamic Realistic Atmospheric Canvas & Weather Engine (Rain, Embers, Sunbeams, Fireflies) */}
      <RealisticAtmosphere mood={activeMoodTheme} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto relative z-20 ${
        activeTab === 'chat'
          ? 'max-w-7xl px-2 sm:px-4 py-2 sm:py-3 flex flex-col'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6'
      }`}>
        
        {/* Widgets on Home Feed View */}
        {activeTab === 'feed' && (
          <>
            {/* Dynamic Atmosphere Mood Banner with Framer Motion */}
            <motion.div
              key={activeMoodTheme}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`px-4 py-2.5 rounded-2xl border transition-all duration-700 flex items-center justify-between shadow-md backdrop-blur-md ${theme.badgeBg}`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-lg">{theme.emoji}</span>
                <span>{theme.bannerText}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 hidden sm:inline">
                Synchronized 2-Person Ambience
              </span>
            </motion.div>

            {/* Dynamic Cheer-Up Alert Banner (Appears when partner is sad or gussa) */}
            <CheerUpBanner />

            {/* Anniversary Countdown & Milestone Widget */}
            <AnniversaryWidget gradient={theme.anniversaryGrad} />

            {/* Real-time Mood Sync Engine with Realistic Tactile Buttons */}
            <MoodSelector theme={theme} />

            {/* Memories of the Day Flashback Collage */}
            <MemoryOfTheDay />
          </>
        )}

        {/* Fluid Tab Views with AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Dynamic Moving Shapes Showcase with Animated Optical / Cosmic Background */}
              <RomanticMorphingGallery />

              <DashboardFeed onOpenUpload={() => setIsUploadOpen(true)} />
              <div className="pt-4">
                <StickyNoteWidget />
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full space-y-3"
            >
              {/* Option to switch to Dedicated Full-Screen WhatsApp Page */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#00a884]/15 border border-[#00a884]/30 text-xs">
                <span className="font-semibold text-slate-800 dark:text-emerald-200 flex items-center gap-2">
                  <span>💬</span> Prefer the authentic full-screen WhatsApp Web layout?
                </span>
                <button
                  onClick={() => navigateTo('whatsapp')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Open WhatsApp Full Screen Page ➔
                </button>
              </div>

              <RealtimeChat theme={theme} onBackToFeed={() => setActiveTab('feed')} />
            </motion.div>
          )}

          {activeTab === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <MemoryVault onOpenUpload={() => setIsUploadOpen(true)} />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <MoodChart />
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <StickyNoteWidget />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Real-time Incoming Hug / Reaction Animation */}
      <LoveReactions />

      {/* Memory Upload Modal */}
      <MemoryUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Settings & Session Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
