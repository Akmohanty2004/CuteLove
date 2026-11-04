import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Image, Shield, LogOut, Settings, Volume2, VolumeX, Sparkles, Plus, BookOpen, BarChart2, StickyNote, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MOOD_THEMES } from '../utils/moodThemes';
import { playMoodAmbience, stopAmbience } from '../utils/ambientAudio';

export const Navbar = ({ activeTab, setActiveTab, onOpenUpload, onOpenSettings }) => {
  const { user, partner, partnerOnline, sessionDaysRemaining, activeMoodTheme, logout, navigateTo } = useAuth();
  const { chatPartnerTyping } = useSocket();
  const [isAudioOn, setIsAudioOn] = useState(false);

  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;
  const partnerDisplayName = partner?.displayName || (user?.username === 'ashis' ? 'Kirti' : 'Ashis');

  const handleTabClick = (tabId) => {
    if (tabId === 'chat') {
      navigateTo('whatsapp');
      return;
    }
    setActiveTab(tabId);
  };

  // When active mood changes, if audio is on, automatically switch ambience!
  useEffect(() => {
    if (isAudioOn) {
      playMoodAmbience(activeMoodTheme);
    }
  }, [activeMoodTheme, isAudioOn]);

  const toggleAudio = () => {
    if (isAudioOn) {
      stopAmbience();
      setIsAudioOn(false);
    } else {
      playMoodAmbience(activeMoodTheme);
      setIsAudioOn(true);
    }
  };

  return (
    <header className={`sticky top-0 z-30 w-full backdrop-blur-xl transition-all duration-700 shadow-sm border-b ${theme.navBg}`}>
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${theme.primaryBtn} flex items-center justify-center text-white shadow-md shadow-black/20 shrink-0 transition-all duration-700`}>
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className={`font-serif font-bold text-base sm:text-xl md:text-2xl tracking-tight truncate transition-colors duration-700 ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>
                Ashis <span className="text-rose-500">&amp;</span> Kirti
              </span>
              <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all duration-700 ${theme.badgeBg}`}>
                <span>{theme.emoji}</span>
                <span>{theme.name}</span>
              </span>
            </div>

            {/* Live Partner Status */}
            <div className={`flex items-center gap-2 text-xs transition-colors duration-700 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${partnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{partnerDisplayName} {partnerOnline ? 'is active now' : 'away'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className={`hidden md:flex items-center p-1.5 rounded-2xl border transition-colors duration-700 ${theme.isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
          {[
            { id: 'feed', label: 'Home Feed', icon: BookOpen },
            { id: 'chat', label: 'Chat', icon: MessageCircle, hasNotification: chatPartnerTyping },
            { id: 'vault', label: 'Memory Vault', icon: Image },
            { id: 'timeline', label: 'Mood Graph', icon: BarChart2 },
            { id: 'notes', label: 'Sticky Notes', icon: StickyNote },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive ? theme.tabActive : theme.tabInactive
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveTabIndicator"
                    className="absolute inset-0 rounded-xl bg-white/20 pointer-events-none"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
                {tab.hasNotification && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Actions & Realistic Audio Toggle & Session Indicator */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          
          {/* Realistic Ambient Sound Generator Toggle Button */}
          <button
            onClick={toggleAudio}
            title={isAudioOn ? `Mute ${theme.soundLabel} ambience` : `Play realistic ${theme.soundLabel} ambience sound`}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              isAudioOn
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md animate-pulse-subtle'
                : theme.isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white'
            }`}
          >
            {isAudioOn ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden sm:inline">{theme.soundLabel}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 opacity-60" />
                <span className="hidden sm:inline">Ambience</span>
              </>
            )}
          </button>

          {/* 30-Day Session Badge */}
          <div
            title="Your session automatically lasts 30 days without re-authenticating"
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              theme.isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>30d Session</span>
          </div>

          {/* WhatsApp Full-Screen Mode Page Launcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('whatsapp')}
            title="Open Dedicated Full-Screen WhatsApp Page"
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
            {chatPartnerTyping && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
            )}
          </motion.button>

          {/* Add Memory Button */}
          <button
            onClick={onOpenUpload}
            className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r ${theme.primaryBtn} text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Memory</span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            title="Couple Settings & Profile"
            className={`p-1.5 sm:p-2.5 rounded-full transition-colors cursor-pointer border ${
              theme.isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50 border-transparent hover:border-rose-100'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log Out (Revokes 30-Day Session)"
            className={`p-1.5 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
              theme.isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className={`md:hidden flex items-center justify-around border-t py-2 transition-colors duration-700 ${
        theme.isDark ? 'bg-slate-950 border-slate-800' : 'bg-white/80 border-rose-100/60'
      }`}>
        {[
          { id: 'feed', label: 'Feed', icon: BookOpen },
          { id: 'chat', label: 'Chat', icon: MessageCircle, hasNotification: chatPartnerTyping },
          { id: 'vault', label: 'Vault', icon: Image },
          { id: 'timeline', label: 'Graph', icon: BarChart2 },
          { id: 'notes', label: 'Notes', icon: StickyNote },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold relative px-2 py-1 rounded-xl cursor-pointer ${
                isActive
                  ? 'text-rose-600 font-black'
                  : theme.isDark
                  ? 'text-slate-200 hover:text-white font-semibold'
                  : 'text-slate-700 hover:text-slate-950 font-semibold'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.hasNotification && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-0 right-2" />
              )}
            </motion.button>
          );
        })}
      </div>
    </header>
  );
};
