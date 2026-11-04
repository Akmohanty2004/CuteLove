import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  Heart,
  Sparkles,
  MessageCircle,
  CheckCheck,
  Smile,
  Flame,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Volume2,
  VolumeX,
  User,
  Shield,
  Clock,
  Calendar,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { playMoodAmbience, stopAmbience } from '../utils/ambientAudio';
import { triggerSprinklerEffect } from './EmojiSprinkler';
import confetti from 'canvas-confetti';

const QUICK_BURSTS = [
  "I love you so much ❤️",
  "Thinking of you right now ✨",
  "Sending 1000 warm hugs 🤗",
  "Can't wait to see your smile 🌸",
  "Sending you sweet kisses 💋",
  "You make my heart melt 🔥",
  "Forever yours 💍",
  "Miss you, my love 🥺",
];

export const RealtimeChat = ({ theme, onBackToFeed }) => {
  const { user, partner, partnerOnline, activeMoodTheme, navigateTo } = useAuth();
  const { chatPartnerTyping, emitChatTyping, emitInstantMessage, emitReaction } = useSocket();
  const queryClient = useQueryClient();

  const [text, setText] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Dynamic viewport tracking for full-screen mode to prevent typing section from getting cut off
  const [viewportHeight, setViewportHeight] = useState(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return window.visualViewport.height;
    }
    return typeof window !== 'undefined' ? window.innerHeight : 800;
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleViewport = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewport);
      window.visualViewport.addEventListener('scroll', handleViewport);
    }
    window.addEventListener('resize', handleViewport);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewport);
        window.visualViewport.removeEventListener('scroll', handleViewport);
      }
      window.removeEventListener('resize', handleViewport);
    };
  }, []);

  // TanStack Query for messages
  const { data: serverMessages = [], isLoading } = useQuery({
    queryKey: ['chatMessages'],
    queryFn: async () => {
      const res = await api.get('/messages?limit=100');
      return res.data?.messages || [];
    },
    refetchInterval: 3000,
  });

  // Merge server and optimistic messages
  const allMessages = [
    ...serverMessages,
    ...optimisticMessages.filter(
      (opt) =>
        !serverMessages.some(
          (srv) =>
            srv.text === opt.text &&
            Math.abs(new Date(srv.createdAt) - new Date(opt.createdAt)) < 5000
        )
    ),
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages.length, chatPartnerTyping]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (messageText) => {
      const res = await api.post('/messages', { text: messageText });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      setOptimisticMessages((prev) =>
        prev.filter((m) => m._id !== data.message?._id)
      );
    },
  });

  const handleSend = async (messageTextToSend) => {
    const messageText = (messageTextToSend || text).trim();
    if (!messageText) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      senderName: user?.displayName || 'Ashis',
      recipientName: partner?.displayName || 'Kirti',
      text: messageText,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // 0ms instant optimistic UI delivery
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    setText('');
    emitChatTyping(false);

    // Instant socket broadcast
    emitInstantMessage(optimisticMsg);

    // Persist to MongoDB
    sendMutation.mutate(messageText);
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    emitChatTyping(e.target.value.length > 0);
  };

  const REACTION_MESSAGES = {
    hug: 'Sending you a warm loving hug 🤗🧸💛',
    kiss: 'Sending you sweet kisses 💋😘🌹',
    sparkles: 'Thinking of you with starlight sparkles ✨⭐💫',
    heart: 'Sending infinite love hearts 💖❤️💕',
    fire: 'You set my heart on fire 🔥❤️‍🔥✨',
  };

  const handleSendQuick = (burst) => {
    handleSend(burst);
    if (burst.includes('🤗') || burst.toLowerCase().includes('hug')) {
      triggerSprinklerEffect('hug');
    } else if (burst.includes('💋') || burst.toLowerCase().includes('kiss')) {
      triggerSprinklerEffect('kiss');
    } else if (burst.includes('✨') || burst.toLowerCase().includes('think')) {
      triggerSprinklerEffect('sparkles');
    } else if (burst.includes('🔥') || burst.toLowerCase().includes('melt')) {
      triggerSprinklerEffect('fire');
    } else {
      triggerSprinklerEffect('heart');
    }
  };

  const handleSendReaction = (type, customLabel) => {
    const reactionText = REACTION_MESSAGES[type] || `Sent you love ${customLabel || 'reaction'} 💕`;
    triggerSprinklerEffect(type);
    emitReaction(type, reactionText);
    handleSend(reactionText);
  };

  const toggleAmbience = () => {
    if (isAudioPlaying) {
      stopAmbience();
      setIsAudioPlaying(false);
    } else {
      playMoodAmbience(activeMoodTheme);
      setIsAudioPlaying(true);
    }
  };

  const isDark = theme?.isDark;
  const partnerName = partner?.displayName || (user?.username === 'ashis' ? 'Kirti' : 'Ashis');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={isFullScreen ? { height: `${viewportHeight}px`, maxHeight: `${viewportHeight}px` } : undefined}
      className={`transition-all duration-300 flex flex-col ${
        isFullScreen
          ? 'fixed inset-0 z-50 w-full p-0 bg-slate-950/98 backdrop-blur-2xl overflow-hidden'
          : `w-full h-full rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-xl border overflow-hidden ${
              isDark
                ? 'bg-slate-900/95 border-slate-800'
                : 'bg-white/95 border-white/80'
            }`
      }`}
    >
      {/* Top Application Bar */}
      <div className={`flex items-center justify-between border-b shrink-0 px-2.5 sm:px-4 z-20 ${
        isFullScreen
          ? 'h-14 sm:h-16 border-white/10 bg-slate-900/90 shadow-xs'
          : 'pb-3 sm:pb-4 border-black/10 dark:border-white/10'
      }`}>
        
        {/* Partner Info & Presence with ONE Dedicated Back Option */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isFullScreen) {
                setIsFullScreen(false);
              } else if (onBackToFeed) {
                onBackToFeed();
              }
            }}
            title={isFullScreen ? 'Exit Full Screen' : 'Back to Dashboard'}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-inherit cursor-pointer flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold">Back</span>
          </motion.button>

          <div className="relative">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${theme.primaryBtn} text-white flex items-center justify-center font-bold font-serif text-lg shadow-md`}>
              {partnerName.charAt(0)}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                isDark ? 'border-slate-900' : 'border-white'
              } ${partnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
              title={partnerOnline ? 'Online now' : 'Offline'}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base sm:text-lg font-serif font-black tracking-tight ${theme.headingText}`}>
                {partnerName}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-flex ${theme.badgeBg}`}>
                <span>{theme.emoji}</span>
                <span>{theme.name}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={`font-semibold ${partnerOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                {partnerOnline ? 'Active now' : 'Away'}
              </span>
              {chatPartnerTyping && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-rose-500 font-bold flex items-center gap-1 animate-pulse"
                >
                  <span>•</span>
                  <span>typing...</span>
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Hug Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleSendReaction('hug', 'Hug')}
            title="Send an Instant Hug"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
          >
            <span>🤗</span>
            <span className="hidden sm:inline">Hug</span>
          </motion.button>

          {/* Quick Kiss Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleSendReaction('kiss', 'Kiss')}
            title="Send an Instant Kiss"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/20 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
          >
            <span>💋</span>
            <span className="hidden sm:inline">Kiss</span>
          </motion.button>

          {/* Ambience Audio Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleAmbience}
            title={isAudioPlaying ? 'Mute Ambience' : 'Play Realistic Mood Ambience'}
            className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              isAudioPlaying
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4 opacity-60" />}
          </motion.button>

          {/* Dedicated Full Screen WhatsApp Page Launcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('whatsapp')}
            title="Open Dedicated Full-Screen WhatsApp Page"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">WhatsApp</span>
          </motion.button>

          {/* Dedicated Full Screen Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Open Full Screen Chat'}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Main Body Area: 2-Panel Layout on Desktop, Fluid Stream on Mobile */}
      <div className="flex-1 flex overflow-hidden pt-2 gap-4">
        
        {/* Left Side Profile & Quick Panel (Desktop only) */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-4 justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Couple Identity Card */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-black/5 dark:border-white/10 shadow-xs text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                  {user?.displayName?.charAt(0) || 'A'}
                </span>
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                <span className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xs">
                  {partnerName.charAt(0)}
                </span>
              </div>
              <h4 className={`text-sm font-bold font-serif ${theme.headingText}`}>
                {user?.displayName} &amp; {partnerName}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Private Two-Person Chat Space
              </p>
            </div>

            {/* In Love Since Counter Badge */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/20 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                In Love Since 10/09/2020
              </span>
              <p className="text-xs font-serif font-bold text-slate-800 dark:text-rose-100 mt-1">
                Forever &amp; Always Together
              </p>
            </div>

            {/* Quick Sentiment Chips */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Quick Love Messages
              </span>
              <div className="space-y-1.5">
                {QUICK_BURSTS.slice(0, 5).map((burst, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendQuick(burst)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-white/80 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/10 transition-colors cursor-pointer truncate"
                  >
                    {burst}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-black/5 dark:border-white/5">
            🔒 30-Day End-to-End Persisted Session
          </div>
        </div>

        {/* Right Panel: Messages Stream & Full-Width Chat */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Scrollable Message Bubbles Stream with Mood Atmosphere Texture */}
          <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-3 relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(currentColor 1.2px, transparent 1.2px)`,
                backgroundSize: '24px 24px',
              }}
            />
            {isLoading && allMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Connecting high-speed real-time couple chat...
              </div>
            ) : allMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-12 h-12 mb-3 text-rose-400 fill-rose-100 stroke-1" />
                </motion.div>
                <p className="font-serif text-sm font-bold text-slate-700 dark:text-slate-300">
                  Welcome to your private chat sanctuary!
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs text-center">
                  Sub-millisecond messaging between {user?.displayName} and {partnerName}. Send a sweet message below!
                </p>
              </div>
            ) : (
              allMessages.map((msg, i) => {
                const isMe = msg.senderName === user?.displayName;
                return (
                  <motion.div
                    key={msg._id || i}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-md text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? `bg-gradient-to-r ${theme.primaryBtn} text-white rounded-tr-none`
                          : isDark
                          ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                          : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-none'
                      }`}
                    >
                      <p className="font-sans break-words whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                          isMe ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator floating row */}
          {chatPartnerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-1.5 text-xs text-rose-500 font-bold flex items-center gap-1.5"
            >
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ✍️
              </motion.span>
              <span>{partnerName} is typing...</span>
            </motion.div>
          )}

          {/* Quick Love Shortcuts Horizontal Scroller */}
          <div className="py-2 px-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 border-t border-black/5 dark:border-white/5">
            {QUICK_BURSTS.map((burst, idx) => (
              <motion.button
                key={idx}
                type="button"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleSendQuick(burst)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-rose-500/30'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                }`}
              >
                {burst}
              </motion.button>
            ))}
          </div>

          {/* Bottom Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className={`pt-2 flex items-center gap-2 shrink-0 px-1 sm:px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] select-text z-30 transition-colors ${
              isDark ? 'bg-slate-900/95' : 'bg-white/95'
            }`}
          >
            <div
              className={`flex-1 flex items-center gap-1.5 px-3 py-1.5 sm:py-2.5 rounded-2xl border shadow-inner transition-colors ${
                isDark
                  ? 'bg-slate-800/95 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}
            >
              {/* Quick Heart Button */}
              <button
                type="button"
                onClick={() => {
                  handleSend("I love you so much ❤️");
                  triggerSprinklerEffect('heart');
                }}
                title="Send Quick Heart"
                className="p-1 rounded-full text-rose-500 hover:text-rose-400 cursor-pointer shrink-0"
              >
                <Heart className="w-5 h-5 fill-rose-500" />
              </button>

              <input
                ref={inputRef}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="sentences"
                enterKeyHint="send"
                spellCheck="true"
                value={text}
                onChange={handleInputChange}
                onFocus={() => {
                  setTimeout(scrollToBottom, 150);
                }}
                placeholder={`Message ${partnerName}...`}
                className="flex-1 bg-transparent border-0 focus:outline-hidden text-base placeholder:text-slate-400 select-text cursor-text min-w-0 py-1"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              disabled={!text.trim() || sendMutation.isPending}
              className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r ${theme.primaryBtn} disabled:opacity-50 text-white shadow-lg cursor-pointer flex items-center justify-center shrink-0 transition-all`}
              title="Send Message"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            </motion.button>
          </form>

        </div>
      </div>
    </motion.div>
  );
};
