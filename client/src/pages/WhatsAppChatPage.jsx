import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  Heart,
  Sparkles,
  Smile,
  ArrowLeft,
  Volume2,
  VolumeX,
  CheckCheck,
  Maximize,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { playMoodAmbience, stopAmbience } from '../utils/ambientAudio';
import { triggerSprinklerEffect } from '../components/EmojiSprinkler';
import { toggleAppFullscreen } from '../utils/fullscreen';

const QUICK_BURSTS = [
  "I love you so much ❤️",
  "Thinking of you right now ✨",
  "Sending 1000 warm hugs 🤗",
  "Can't wait to see your smile 🌸",
  "Sending you sweet kisses 💋",
  "You make my heart melt 🔥",
  "Forever yours 💍",
  "Miss you, my sweetheart 🥺",
];

const EMOJI_PALETTE = [
  '❤️', '💕', '💖', '💗', '💓', '💞', '💘', '💝',
  '💋', '😘', '🥰', '😍', '🤗', '🥺', '🌹', '🌸',
  '🔥', '✨', '💍', '💌', '☀️', '🌙', '⭐', '🕊️',
  '🍫', '🥂', '🧸', '🍓', '☕', '🧁', '🍦', '🎈',
];

// Complete mode-adaptive dynamic themes for full-screen chat
const CHAT_MOOD_CONFIGS = {
  happy: {
    id: 'happy',
    name: 'Sunlit Blossoms',
    emoji: '😊',
    topBar: 'bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500',
    accentText: 'text-rose-500',
    accentBg: 'bg-rose-500 hover:bg-rose-600',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    onlineDot: 'bg-rose-500',
    pageBgDark: 'bg-[#181014] text-[#fce7f3]',
    pageBgLight: 'bg-[#fff5f5] text-[#4a044e]',
    headerDark: 'bg-[#291722] text-[#fbcfe8]',
    headerLight: 'bg-[#ffe4e6] text-[#881337]',
    chatAreaDark: 'bg-[#140b10]',
    chatAreaLight: 'bg-[#fff1f2]',
    doodlePattern: `radial-gradient(#f43f5e 1.2px, transparent 1.2px), radial-gradient(#fbbf24 1.2px, transparent 1.2px)`,
    myBubbleDark: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-950/40 rounded-tr-none',
    myBubbleLight: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20 rounded-tr-none',
    partnerBubbleDark: 'bg-[#2a1723] text-rose-50 border border-rose-500/25 rounded-tl-none',
    partnerBubbleLight: 'bg-white text-slate-800 border border-rose-200/70 shadow-xs rounded-tl-none',
    myMetaDark: 'text-rose-200',
    myMetaLight: 'text-rose-100',
    partnerMetaDark: 'text-rose-300/70',
    partnerMetaLight: 'text-slate-400',
    checkColor: 'text-amber-300',
    sendBtn: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-500/30',
    avatarGradient: 'from-amber-400 via-rose-500 to-pink-500',
    inputBgDark: 'bg-[#261420] text-rose-50 placeholder-rose-300/40',
    inputBgLight: 'bg-white text-slate-900 placeholder-slate-400 shadow-xs',
    typingText: 'text-rose-400',
    quickBurstDark: 'bg-[#291722] hover:bg-[#381e2e] text-rose-200 border-[#3d1f33]',
    quickBurstLight: 'bg-white hover:bg-rose-50 text-slate-800 border-rose-200/80 shadow-xs',
  },
  normal: {
    id: 'normal',
    name: 'Serene Harmony',
    emoji: '😌',
    topBar: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600',
    accentText: 'text-emerald-500',
    accentBg: 'bg-emerald-600 hover:bg-emerald-700',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    onlineDot: 'bg-emerald-400',
    pageBgDark: 'bg-[#0a1612] text-[#e6f4ea]',
    pageBgLight: 'bg-[#f0fdf4] text-[#064e3b]',
    headerDark: 'bg-[#152e25] text-[#a7f3d0]',
    headerLight: 'bg-[#dcfce7] text-[#065f46]',
    chatAreaDark: 'bg-[#08120e]',
    chatAreaLight: 'bg-[#f4fcf6]',
    doodlePattern: `radial-gradient(#10b981 1.2px, transparent 1.2px), radial-gradient(#34d399 1.2px, transparent 1.2px)`,
    myBubbleDark: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 rounded-tr-none',
    myBubbleLight: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20 rounded-tr-none',
    partnerBubbleDark: 'bg-[#162e25] text-emerald-50 border border-emerald-500/25 rounded-tl-none',
    partnerBubbleLight: 'bg-white text-slate-800 border border-emerald-200/70 shadow-xs rounded-tl-none',
    myMetaDark: 'text-emerald-200',
    myMetaLight: 'text-emerald-100',
    partnerMetaDark: 'text-emerald-300/70',
    partnerMetaLight: 'text-slate-400',
    checkColor: 'text-teal-300',
    sendBtn: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30',
    avatarGradient: 'from-emerald-400 to-teal-600',
    inputBgDark: 'bg-[#142921] text-emerald-50 placeholder-emerald-300/40',
    inputBgLight: 'bg-white text-slate-900 placeholder-slate-400 shadow-xs',
    typingText: 'text-emerald-400',
    quickBurstDark: 'bg-[#162e25] hover:bg-[#1d3d31] text-emerald-200 border-[#1f4236]',
    quickBurstLight: 'bg-white hover:bg-emerald-50 text-slate-800 border-emerald-200/80 shadow-xs',
  },
  sad: {
    id: 'sad',
    name: 'Rainy Twilight',
    emoji: '🥺',
    topBar: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400',
    accentText: 'text-cyan-400',
    accentBg: 'bg-blue-600 hover:bg-blue-700',
    badgeBg: 'bg-blue-500/15 text-cyan-300 border-blue-500/30',
    onlineDot: 'bg-cyan-400',
    pageBgDark: 'bg-[#080d1a] text-[#e0e7ff]',
    pageBgLight: 'bg-[#eff6ff] text-[#1e1b4b]',
    headerDark: 'bg-[#14203a] text-[#bfdbfe]',
    headerLight: 'bg-[#dbeafe] text-[#1e3a8a]',
    chatAreaDark: 'bg-[#060a14]',
    chatAreaLight: 'bg-[#f0f7ff]',
    doodlePattern: `radial-gradient(#38bdf8 1.2px, transparent 1.2px), radial-gradient(#818cf8 1.2px, transparent 1.2px)`,
    myBubbleDark: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/40 rounded-tr-none',
    myBubbleLight: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/20 rounded-tr-none',
    partnerBubbleDark: 'bg-[#15223c] text-blue-50 border border-blue-500/25 rounded-tl-none',
    partnerBubbleLight: 'bg-white text-slate-800 border border-blue-200/70 shadow-xs rounded-tl-none',
    myMetaDark: 'text-cyan-200',
    myMetaLight: 'text-blue-100',
    partnerMetaDark: 'text-blue-300/70',
    partnerMetaLight: 'text-slate-400',
    checkColor: 'text-cyan-300',
    sendBtn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30',
    avatarGradient: 'from-blue-500 to-cyan-400',
    inputBgDark: 'bg-[#131e36] text-blue-50 placeholder-blue-300/40',
    inputBgLight: 'bg-white text-slate-900 placeholder-slate-400 shadow-xs',
    typingText: 'text-cyan-400',
    quickBurstDark: 'bg-[#15223c] hover:bg-[#1e2f52] text-blue-200 border-[#22355c]',
    quickBurstLight: 'bg-white hover:bg-blue-50 text-slate-800 border-blue-200/80 shadow-xs',
  },
  gussa: {
    id: 'gussa',
    name: 'Fiery Romance',
    emoji: '😤',
    topBar: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500',
    accentText: 'text-red-500',
    accentBg: 'bg-rose-600 hover:bg-rose-700',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    onlineDot: 'bg-orange-400',
    pageBgDark: 'bg-[#180a0e] text-[#ffe4e6]',
    pageBgLight: 'bg-[#fff1f2] text-[#4c0519]',
    headerDark: 'bg-[#2e101b] text-[#fecdd3]',
    headerLight: 'bg-[#fecdd3] text-[#881337]',
    chatAreaDark: 'bg-[#13070b]',
    chatAreaLight: 'bg-[#fff5f5]',
    doodlePattern: `radial-gradient(#ef4444 1.2px, transparent 1.2px), radial-gradient(#f97316 1.2px, transparent 1.2px)`,
    myBubbleDark: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-950/40 rounded-tr-none',
    myBubbleLight: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm shadow-rose-500/20 rounded-tr-none',
    partnerBubbleDark: 'bg-[#2b1019] text-rose-50 border border-red-500/25 rounded-tl-none',
    partnerBubbleLight: 'bg-white text-slate-800 border border-rose-200/70 shadow-xs rounded-tl-none',
    myMetaDark: 'text-amber-200',
    myMetaLight: 'text-rose-100',
    partnerMetaDark: 'text-rose-300/70',
    partnerMetaLight: 'text-slate-400',
    checkColor: 'text-amber-300',
    sendBtn: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-rose-600/30',
    avatarGradient: 'from-red-500 to-amber-500',
    inputBgDark: 'bg-[#290e18] text-rose-50 placeholder-rose-300/40',
    inputBgLight: 'bg-white text-slate-900 placeholder-slate-400 shadow-xs',
    typingText: 'text-rose-400',
    quickBurstDark: 'bg-[#2b1019] hover:bg-[#3c1724] text-rose-200 border-[#421727]',
    quickBurstLight: 'bg-white hover:bg-rose-50 text-slate-800 border-rose-200/80 shadow-xs',
  },
};

export const WhatsAppChatPage = ({ onBack }) => {
  const { user, partner, partnerOnline, activeMoodTheme } = useAuth();
  const { chatPartnerTyping, emitChatTyping, emitInstantMessage, emitReaction } = useSocket();
  const queryClient = useQueryClient();

  const [text, setText] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Dynamic viewport height & keyboard tracking to guarantee the input bar stays visible above the mobile keyboard
  const [viewportHeight, setViewportHeight] = useState(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return window.visualViewport.height;
    }
    return typeof window !== 'undefined' ? window.innerHeight : 800;
  });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Active Dynamic Chat Mood Theme
  const chatTheme = CHAT_MOOD_CONFIGS[activeMoodTheme] || CHAT_MOOD_CONFIGS.happy;

  // Track visualViewport for rock-solid mobile keyboard responsiveness & lock outer body scrolling
  useEffect(() => {
    const handleViewport = () => {
      if (window.visualViewport) {
        const vvh = window.visualViewport.height;
        setViewportHeight(vvh);
        const kbActive = typeof window !== 'undefined' && (window.innerHeight - vvh > 120);
        setIsKeyboardOpen(kbActive);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    handleViewport();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewport);
      window.visualViewport.addEventListener('scroll', handleViewport);
    }
    window.addEventListener('resize', handleViewport);

    // Lock body scrolling completely so mobile browser cannot scroll the background
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevWidth = document.body.style.width;
    const prevHeight = document.body.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    window.scrollTo(0, 0);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewport);
        window.visualViewport.removeEventListener('scroll', handleViewport);
      }
      window.removeEventListener('resize', handleViewport);

      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.width = prevWidth;
      document.body.style.height = prevHeight;
    };
  }, []);

  // TanStack Query for messages
  const { data: serverMessages = [], isLoading } = useQuery({
    queryKey: ['chatMessages'],
    queryFn: async () => {
      const res = await api.get('/messages?limit=120');
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

  // Web Audio click/pop sound
  const playSendSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Audio not permitted or restricted
    }
  };

  const handleSend = async (messageTextToSend) => {
    const messageText = (messageTextToSend || text).trim();
    if (!messageText) return;

    playSendSound();

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      senderName: user?.displayName || 'Ashis',
      recipientName: partner?.displayName || 'Kirti',
      text: messageText,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Instant optimistic UI delivery
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    setText('');
    setShowEmojiPicker(false);
    emitChatTyping(false);

    // Instant socket broadcast
    emitInstantMessage(optimisticMsg);

    // Persist to MongoDB
    sendMutation.mutate(messageText);

    setTimeout(scrollToBottom, 50);
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

  const handleAddEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 20);
  };

  const handleSendReaction = (type, customLabel) => {
    const reactionText = REACTION_MESSAGES[type] || `Sent you love ${customLabel || 'reaction'} 💕`;

    // 1. Trigger sprinkler shower on current screen
    triggerSprinklerEffect(type);

    // 2. Broadcast reaction event to partner so it sprinkles on their screen too
    emitReaction(type, reactionText);

    // 3. Show in the chatting section stream
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

  const partnerName = partner?.displayName || (user?.username === 'ashis' ? 'Kirti' : 'Ashis');
  const myName = user?.displayName || (user?.username === 'ashis' ? 'Ashis' : 'Kirti');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: isKeyboardOpen && viewportHeight ? `${viewportHeight}px` : '100dvh',
        maxHeight: isKeyboardOpen && viewportHeight ? `${viewportHeight}px` : '100dvh',
        width: '100vw',
      }}
      className={`flex flex-col font-sans overflow-hidden select-none transition-colors duration-700 ${
        isDarkTheme ? chatTheme.pageBgDark : chatTheme.pageBgLight
      }`}
    >
      {/* Dynamic Mood Gradient Accent Bar */}
      <div className={`h-1.5 sm:h-2 w-full ${chatTheme.topBar} shrink-0 transition-all duration-700 shadow-xs`} />

      {/* ========================================================= */}
      {/* FULL SCREEN CHAT HEADER: Only Back Option + Partner Info */}
      {/* ========================================================= */}
      <header
        className={`h-14 sm:h-16 px-2.5 sm:px-4 flex items-center justify-between shrink-0 border-b z-20 shadow-xs transition-colors duration-700 ${
          isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
        }`}
      >
        {/* Left Side: ONE Back Option + Partner Profile */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Dedicated Back Option to Sanctuary Dashboard */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-inherit cursor-pointer flex items-center gap-1 transition-all shadow-xs shrink-0"
            title="Back to Love Sanctuary Dashboard"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold">Back</span>
          </motion.button>

          {/* Partner Avatar with Online Dot */}
          <div className="relative shrink-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${chatTheme.avatarGradient} text-white flex items-center justify-center font-bold font-serif text-sm sm:text-base shadow-sm border-2 border-white/30`}
            >
              {partnerName.charAt(0)}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                isDarkTheme ? 'border-slate-900' : 'border-white'
              } ${partnerOnline ? `${chatTheme.onlineDot} animate-pulse` : 'bg-slate-400'}`}
            />
          </div>

          {/* Partner Name & Live Status */}
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-base font-bold truncate flex items-center gap-1.5">
              <span>{partnerName} ❤️</span>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border hidden md:inline ${chatTheme.badgeBg}`}>
                {chatTheme.emoji} {chatTheme.name}
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] opacity-75 truncate">
              {chatPartnerTyping ? (
                <span className={`${chatTheme.typingText} font-semibold animate-pulse`}>
                  typing sweet message...
                </span>
              ) : partnerOnline ? (
                <span className={`${chatTheme.accentText} font-semibold`}>online &amp; loving you</span>
              ) : (
                <span>last seen recently</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Romantic Reaction Sprinklers + Sound Ambience */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Instant Hug Reaction */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendReaction('hug', 'Hug')}
            title="Send Warm Hug Sprinkler Shower"
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/25 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <span className="text-sm sm:text-base leading-none">🤗</span>
            <span className="hidden sm:inline">Hug</span>
          </motion.button>

          {/* Instant Kiss Reaction */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendReaction('kiss', 'Kiss')}
            title="Send Sweet Kisses Sprinkler Shower"
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1 rounded-full bg-pink-500/15 hover:bg-pink-500/25 text-pink-500 border border-pink-500/25 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <span className="text-sm sm:text-base leading-none">💋</span>
            <span className="hidden sm:inline">Kiss</span>
          </motion.button>

          {/* Instant Sparkles Reaction */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendReaction('sparkles', 'Starlight Sparkles')}
            title="Send Starlight Sparkles Sprinkler Shower"
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1 rounded-full bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-500 border border-yellow-400/25 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
            <span className="hidden sm:inline">Sparkle</span>
          </motion.button>

          {/* Instant Infinite Heart Reaction */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendReaction('heart', 'Love Hearts')}
            title="Send Infinite Hearts Sprinkler Shower"
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/25 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            <span className="hidden sm:inline">Heart</span>
          </motion.button>

          {/* Realistic Mood Ambience Audio Toggle */}
          <button
            onClick={toggleAmbience}
            title={isAudioPlaying ? 'Mute Ambience Audio' : 'Play Romantic Mood Ambience'}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors text-inherit ml-0.5"
          >
            {isAudioPlaying ? (
              <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 ${chatTheme.accentText} animate-pulse`} />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
            )}
          </button>

          {/* Dedicated Full Screen Button (Hides mobile browser top URL bar) */}
          <button
            onClick={toggleAppFullscreen}
            title="Toggle True Full Screen (Hides browser top bar)"
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors text-inherit ml-0.5"
          >
            <Maximize className="w-4 h-4 sm:w-5 sm:h-5 opacity-75 hover:opacity-100" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CHAT AREA: Smooth Message Flow with Dynamic Wallpaper */}
      {/* ========================================================= */}
      <main
        className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-8 md:px-16 py-3 space-y-2 relative overscroll-contain transition-colors duration-700 ${
          isDarkTheme ? chatTheme.chatAreaDark : chatTheme.chatAreaLight
        }`}
      >
        {/* Dynamic Mood Wallpaper Texture Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.04]"
          style={{
            backgroundImage: chatTheme.doodlePattern,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Date / Haven Badge */}
        <div className="flex justify-center my-2 relative z-10">
          <span
            className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs uppercase tracking-wider border ${
              isDarkTheme
                ? 'bg-black/60 text-slate-300 border-white/10'
                : 'bg-white/95 text-slate-700 border-slate-200'
            }`}
          >
            Today • Ashis &amp; Kirti Private Haven ({chatTheme.name})
          </span>
        </div>

        {/* Empty state or message list */}
        {isLoading && allMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs opacity-70">
            Connecting to romantic chat stream...
          </div>
        ) : allMessages.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center relative z-10">
            <Heart className={`w-12 h-12 mb-2 ${chatTheme.accentText} fill-current opacity-30 animate-pulse`} />
            <p className="text-sm font-bold opacity-80">
              Your private conversation is ready
            </p>
            <p className="text-xs opacity-60 mt-1">
              Type your message below or tap any quick sentiment!
            </p>
          </div>
        ) : (
          allMessages.map((msg, idx) => {
            const isMe = msg.senderName === myName;
            return (
              <motion.div
                key={msg._id || idx}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className={`flex flex-col relative z-10 ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md text-xs sm:text-sm leading-relaxed relative ${
                    isMe
                      ? isDarkTheme
                        ? chatTheme.myBubbleDark
                        : chatTheme.myBubbleLight
                      : isDarkTheme
                      ? chatTheme.partnerBubbleDark
                      : chatTheme.partnerBubbleLight
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap select-text">{msg.text}</p>
                  
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe
                        ? isDarkTheme
                          ? chatTheme.myMetaDark
                          : chatTheme.myMetaLight
                        : isDarkTheme
                        ? chatTheme.partnerMetaDark
                        : chatTheme.partnerMetaLight
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && (
                      <CheckCheck className={`w-3.5 h-3.5 ${chatTheme.checkColor} stroke-[2.5]`} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Live Partner Typing Indicator */}
        {chatPartnerTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 relative z-10 py-1"
          >
            <div
              className={`px-3 py-1.5 rounded-2xl rounded-tl-none text-xs font-semibold flex items-center gap-1.5 shadow-sm border ${
                isDarkTheme
                  ? 'bg-black/60 text-slate-200 border-white/10'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <span className={`${chatTheme.typingText} animate-pulse`}>
                {partnerName} is typing
              </span>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ========================================================= */}
      {/* EMOJI POPUP KEYBOARD (IF OPEN) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`p-2.5 border-t max-h-40 overflow-y-auto grid grid-cols-8 sm:grid-cols-16 gap-1.5 shrink-0 transition-colors z-30 ${
              isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
            }`}
          >
            {EMOJI_PALETTE.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="text-xl p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-125 cursor-pointer text-center"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* QUICK LOVE SENTIMENTS HORIZONTAL CAROUSEL */}
      {/* ========================================================= */}
      <div
        className={`py-1.5 px-2 sm:px-4 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 border-t transition-colors z-20 ${
          isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
        }`}
      >
        {QUICK_BURSTS.map((burst, idx) => (
          <motion.button
            key={idx}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSendQuick(burst)}
            className={`whitespace-nowrap px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
              isDarkTheme ? chatTheme.quickBurstDark : chatTheme.quickBurstLight
            }`}
          >
            {burst}
          </motion.button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* RESPONSIVE CHAT INPUT BAR - GUARANTEED ALWAYS VISIBLE */}
      {/* ========================================================= */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className={`shrink-0 w-full px-2 py-1.5 sm:p-2.5 flex items-center gap-2 border-t z-30 select-text ${
          isKeyboardOpen ? 'pb-1.5' : 'pb-[max(0.6rem,env(safe-area-inset-bottom))]'
        } transition-colors shadow-lg ${
          isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
        }`}
      >
        {/* Input pill with emoji button, text input, and quick heart */}
        <div
          className={`flex-1 flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full border shadow-inner transition-colors ${
            isDarkTheme
              ? 'bg-black/60 border-white/15 text-white'
              : 'bg-white border-slate-300 text-slate-900 shadow-xs'
          }`}
        >
          {/* Romantic Emoji Picker Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Romantic Emojis"
            className={`p-1 rounded-full cursor-pointer transition-colors shrink-0 ${
              showEmojiPicker ? chatTheme.accentText : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Typing Option Box - Explicitly keyboard-friendly and touch-focused */}
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
              setTimeout(scrollToBottom, 200);
            }}
            placeholder={`Message ${partnerName}...`}
            className="flex-1 bg-transparent border-0 focus:outline-hidden text-base placeholder:text-slate-400 select-text cursor-text min-w-0 py-1"
          />

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
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-rose-500" />
          </button>
        </div>

        {/* Circular Send Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          disabled={!text.trim() || sendMutation.isPending}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white cursor-pointer transition-all disabled:opacity-40 flex items-center justify-center shrink-0 shadow-md ${
            text.trim() ? `${chatTheme.sendBtn}` : 'bg-slate-500 opacity-60'
          }`}
          title="Send Message"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
        </motion.button>
      </form>
    </div>
  );
};

export default WhatsAppChatPage;
