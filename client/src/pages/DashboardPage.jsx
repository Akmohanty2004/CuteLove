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

  // Clicking chat directly opens authentic full-screen WhatsApp chat view (no navbar covering it)
  React.useEffect(() => {
    if (activeTab === 'chat') {
      navigateTo('whatsapp');
      setActiveTab('feed');
    }
  }, [activeTab, navigateTo]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 bg-gradient-to-br ${theme.bgGradient} selection:bg-rose-200 selection:text-rose-900 ${activeTab === 'chat' ? 'pb-0 h-[100dvh] max-h-[100dvh] overflow-hidden' : 'pb-16'} relative overflow-x-hidden ${theme.isDark ? 'dark-theme' : ''}`}>
      
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
          ? 'max-w-7xl px-2 sm:px-4 py-1 flex flex-col h-[calc(100%-4rem)] min-h-0 overflow-hidden'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6'
      }`}>
        
        {/* ======================================================== */}
        {/* 1. HOME FEED SECTION (Instant zero-latency tab switching) */}
        {/* ======================================================== */}
        <div className={`space-y-6 ${activeTab === 'feed' ? 'block' : 'hidden'}`}>
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

          {/* Dynamic Moving Shapes Showcase with Animated Optical / Cosmic Background */}
          <RomanticMorphingGallery isTabActive={activeTab === 'feed'} />

          {/* Dashboard Feed with Card Shuffle Scroll Animation */}
          <DashboardFeed onOpenUpload={() => setIsUploadOpen(true)} />

          <div className="pt-4">
            <StickyNoteWidget />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. CHAT TAB (Embedded fallback when not full-screen) */}
        {/* ======================================================== */}
        <div className={`flex-1 min-h-0 flex flex-col h-full overflow-hidden ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
          <RealtimeChat
            theme={theme}
            onBackToFeed={() => setActiveTab('feed')}
          />
        </div>

        {/* ======================================================== */}
        {/* 3. MEMORY VAULT SECTION (Instant zero-latency tab switching) */}
        {/* ======================================================== */}
        <div className={activeTab === 'vault' ? 'block' : 'hidden'}>
          <MemoryVault onOpenUpload={() => setIsUploadOpen(true)} />
        </div>

        {/* ======================================================== */}
        {/* 4. MOOD GRAPH / TIMELINE SECTION (Instant zero-latency) */}
        {/* ======================================================== */}
        <div className={activeTab === 'timeline' ? 'block' : 'hidden'}>
          <MoodChart />
        </div>

        {/* ======================================================== */}
        {/* 5. STICKY NOTES SECTION (Instant zero-latency) */}
        {/* ======================================================== */}
        <div className={activeTab === 'notes' ? 'block' : 'hidden'}>
          <StickyNoteWidget />
        </div>
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
