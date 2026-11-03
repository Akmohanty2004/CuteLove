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
  Search,
  ArrowLeft,
  X,
  Volume2,
  VolumeX,
  Calendar,
  Check,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { playMoodAmbience, stopAmbience } from '../utils/ambientAudio';
import confetti from 'canvas-confetti';

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
  '🍫', '🥂', '🧸', '🍓', '☕', '🧁', '🍦', '🎈'
];

// Complete mode-adaptive dynamic themes for full chat overhaul
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
    sidebarDark: 'bg-[#1e1219] border-[#2e1725]',
    sidebarLight: 'bg-[#fff0f3] border-[#fed7e2]',
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
    sidebarDark: 'bg-[#0f211b] border-[#163329]',
    sidebarLight: 'bg-[#e6f9ed] border-[#c6f0d4]',
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
    sidebarDark: 'bg-[#0e172a] border-[#1a2948]',
    sidebarLight: 'bg-[#e0e7ff] border-[#c7d2fe]',
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
    sidebarDark: 'bg-[#220d14] border-[#36131e]',
    sidebarLight: 'bg-[#ffe4e6] border-[#fecdd3]',
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
  const { user, partner, partnerOnline, activeMoodTheme, setCurrentPage } = useAuth();
  const { chatPartnerTyping, emitChatTyping, emitInstantMessage, emitReaction } = useSocket();
  const queryClient = useQueryClient();

  const [text, setText] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' or 'sidebar'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Active Dynamic Chat Mood Theme
  const chatTheme = CHAT_MOOD_CONFIGS[activeMoodTheme] || CHAT_MOOD_CONFIGS.happy;

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

  // Filter messages by search if active
  const filteredMessages = searchQuery.trim()
    ? allMessages.filter((m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allMessages;

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
      // Audio not permitted or blocked
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

    // 0ms instant optimistic UI delivery
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    setText('');
    setShowEmojiPicker(false);
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

  const handleSendQuick = (burst) => {
    handleSend(burst);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#34d399', '#38bdf8'],
    });
  };

  const handleAddEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 20);
  };

  const handleSendReaction = (type, label) => {
    emitReaction(type, `Sent from ${chatTheme.name} Chat Space with all my heart! ❤️`);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#34d399', '#ec4899'],
    });
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
  const lastMessage = allMessages[allMessages.length - 1];

  return (
    <div
      className={`fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] flex flex-col font-sans overflow-hidden transition-colors duration-700 ${
        isDarkTheme ? chatTheme.pageBgDark : chatTheme.pageBgLight
      }`}
    >
      {/* Dynamic Mood Gradient Accent Bar */}
      <div className={`h-2.5 w-full ${chatTheme.topBar} shrink-0 transition-all duration-700 shadow-md`} />

      {/* Main WhatsApp Window Container */}
      <div className="flex-1 min-h-0 flex overflow-hidden w-full">
        {/* ========================================================= */}
        {/* LEFT SIDEBAR: User Header, Search & Couple Conversations */}
        {/* ========================================================= */}
        <div
          className={`${
            mobileTab === 'sidebar' ? 'flex w-full' : 'hidden'
          } md:flex md:w-[360px] lg:w-[400px] shrink-0 flex-col border-r transition-colors duration-700 ${
            isDarkTheme ? chatTheme.sidebarDark : chatTheme.sidebarLight
          }`}
        >
          {/* Left Top Header */}
          <div
            className={`h-16 px-4 flex items-center justify-between shrink-0 transition-colors duration-700 ${
              isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
            }`}
          >
            {/* Current User Avatar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${chatTheme.avatarGradient} text-white flex items-center justify-center font-bold font-serif text-base shadow-md border-2 border-white/20`}
                >
                  {myName.charAt(0)}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${chatTheme.onlineDot} border-2 border-black/40`} />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>{myName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${chatTheme.badgeBg}`}>
                    {chatTheme.emoji} {chatTheme.name}
                  </span>
                </h3>
                <span className="text-[10px] opacity-75 font-semibold">
                  30-Day Protected Session
                </span>
              </div>
            </div>

            {/* Left Header Actions */}
            <div className="flex items-center gap-1">
              {/* Back to Sanctuary Dashboard */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                title="Return to Love Memory Sanctuary Dashboard"
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              {/* Romantic Ambience Audio Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleAmbience}
                title={isAudioPlaying ? 'Mute Ambience' : 'Play Realistic Mood Ambience'}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
              >
                {isAudioPlaying ? (
                  <Volume2 className={`w-5 h-5 ${chatTheme.accentText} animate-pulse`} />
                ) : (
                  <VolumeX className="w-5 h-5 opacity-60" />
                )}
              </motion.button>

              {/* Theme Toggle (Dark / Light) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                title={isDarkTheme ? 'Switch to Light Chat' : 'Switch to Dark Chat'}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
              >
                <Sparkles className={`w-4 h-4 ${chatTheme.accentText}`} />
              </motion.button>
            </div>
          </div>

          {/* Search Box */}
          <div
            className={`p-2.5 border-b shrink-0 transition-colors duration-700 ${
              isDarkTheme ? 'bg-black/15 border-white/5' : 'bg-white/60 border-black/5'
            }`}
          >
            <div
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs ${
                isDarkTheme ? 'bg-white/10 text-white' : 'bg-white text-slate-700 shadow-xs'
              }`}
            >
              <Search className="w-4 h-4 opacity-70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-transparent border-0 focus:outline-hidden text-xs placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="cursor-pointer">
                  <X className="w-3.5 h-3.5 opacity-70" />
                </button>
              )}
            </div>
          </div>

          {/* Dedicated Couple Chat Item */}
          <div className="flex-1 overflow-y-auto">
            <div
              onClick={() => setMobileTab('chat')}
              className={`p-3.5 flex items-center gap-3.5 cursor-pointer transition-colors border-b ${
                isDarkTheme
                  ? 'bg-white/10 border-white/5 hover:bg-white/15'
                  : 'bg-white/80 border-black/5 hover:bg-white'
              }`}
            >
              {/* Partner Avatar with Glowing Halo */}
              <div className="relative shrink-0">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-tr ${chatTheme.avatarGradient} text-white flex items-center justify-center font-bold font-serif text-xl shadow-md border-2 border-white/30`}
                >
                  {partnerName.charAt(0)}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                    isDarkTheme ? 'border-slate-900' : 'border-white'
                  } ${partnerOnline ? `${chatTheme.onlineDot} animate-pulse` : 'bg-slate-400'}`}
                />
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-sm truncate">
                      {partnerName} ❤️
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${chatTheme.badgeBg}`}>
                      Forever
                    </span>
                  </div>
                  <span className="text-[11px] opacity-70 shrink-0">
                    {lastMessage
                      ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </span>
                </div>

                {/* Subtitle / Last message preview */}
                <div className="flex items-center justify-between">
                  <p className="text-xs opacity-75 truncate flex items-center gap-1">
                    {chatPartnerTyping ? (
                      <span className={`${chatTheme.typingText} font-semibold flex items-center gap-1 animate-pulse`}>
                        <span>typing...</span>
                      </span>
                    ) : lastMessage ? (
                      <>
                        <CheckCheck className={`w-3.5 h-3.5 ${chatTheme.checkColor} shrink-0`} />
                        <span className="truncate">{lastMessage.text}</span>
                      </>
                    ) : (
                      <span>Start our sweet conversation...</span>
                    )}
                  </p>
                  <span className={`w-2 h-2 rounded-full ${chatTheme.onlineDot} shrink-0 ml-1`} />
                </div>
              </div>
            </div>

            {/* Couple Romantic Sub-Banner */}
            <div
              className={`m-3 p-3 rounded-2xl border transition-colors ${
                isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white/80 border-rose-100 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-3.5 h-3.5 ${chatTheme.accentText} fill-current`} />
                <span className={`text-[11px] font-bold uppercase tracking-wider ${chatTheme.accentText}`}>
                  In Love Since 10/09/2020
                </span>
              </div>
              <p className="text-xs font-serif italic opacity-85">
                "Ashis and Kirti's shared universe. Every word preserved for eternity."
              </p>
            </div>

            {/* Quick Love Bursts Panel */}
            <div className="p-3">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-2 block px-1">
                Quick Sentiments (1-Tap Send)
              </span>
              <div className="space-y-1.5">
                {QUICK_BURSTS.map((burst, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendQuick(burst)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer truncate ${
                      isDarkTheme ? chatTheme.quickBurstDark : chatTheme.quickBurstLight
                    }`}
                  >
                    {burst}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Left Footer: Return to Sanctuary Button */}
          <div
            className={`p-3 border-t shrink-0 transition-colors duration-700 ${
              isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all ${chatTheme.sendBtn}`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Memory Sanctuary</span>
            </motion.button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT MAIN CHAT AREA: Dynamic Mood Themed Conversation */}
        {/* ========================================================= */}
        <div
          className={`${
            mobileTab === 'chat' ? 'flex' : 'hidden'
          } md:flex flex-1 min-h-0 flex-col overflow-hidden relative w-full`}
        >
          {/* Right Top Header */}
          <div
            className={`h-16 px-3 sm:px-4 flex items-center justify-between shrink-0 border-b z-10 transition-colors duration-700 ${
              isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
            }`}
          >
            {/* Partner Avatar & Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Back to Sanctuary Dashboard */}
              <button
                onClick={onBack}
                className="p-1.5 -ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-inherit cursor-pointer flex items-center gap-1 transition-colors"
                title="Return to Love Memory Sanctuary Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-xs font-semibold hidden xs:inline">Back</span>
              </button>

              {/* Mobile Toggle to Sentiments & Search */}
              <button
                onClick={() => setMobileTab((prev) => (prev === 'sidebar' ? 'chat' : 'sidebar'))}
                className="md:hidden p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-inherit cursor-pointer"
                title="Toggle Sentiments & Search"
              >
                <Layers className="w-4 h-4 opacity-75" />
              </button>

              <div className="relative">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${chatTheme.avatarGradient} text-white flex items-center justify-center font-bold font-serif text-base sm:text-lg shadow-sm border-2 border-white/30`}
                >
                  {partnerName.charAt(0)}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                    isDarkTheme ? 'border-slate-900' : 'border-white'
                  } ${partnerOnline ? `${chatTheme.onlineDot} animate-pulse` : 'bg-slate-400'}`}
                />
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold truncate max-w-[120px] sm:max-w-none flex items-center gap-1.5">
                  <span>{partnerName} ❤️</span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border hidden sm:inline ${chatTheme.badgeBg}`}>
                    {chatTheme.emoji} {chatTheme.name} Mode
                  </span>
                </h3>
                <p className="text-[11px] opacity-75">
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

            {/* Right Header Action Icons (CALLS REMOVED, ROMANTIC REACTIONS ADDED) */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Instant Hug Reaction */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSendReaction('hug', 'Hug')}
                title="Send a Warm Hug reaction"
                className="px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/25 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>🤗</span>
                <span className="hidden sm:inline">Hug</span>
              </motion.button>

              {/* Instant Kiss Reaction */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSendReaction('kiss', 'Kiss')}
                title="Send a Sweet Kiss reaction"
                className="px-2.5 sm:px-3 py-1.5 rounded-full bg-pink-500/15 hover:bg-pink-500/25 text-pink-500 border border-pink-500/25 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>💋</span>
                <span className="hidden sm:inline">Kiss</span>
              </motion.button>

              {/* Instant Love Burst Reaction */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  handleSendReaction('sparkles', 'Starlight Heart');
                  confetti({ particleCount: 30, spread: 60 });
                }}
                title="Send Starlight Burst"
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-amber-400 cursor-pointer transition-colors"
              >
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </motion.button>

              {/* Return to Sanctuary (Desktop) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                title="Back to Love Sanctuary Dashboard"
                className={`ml-1 px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-sm cursor-pointer transition-all hidden sm:flex items-center gap-1 ${chatTheme.sendBtn}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </motion.button>

              {/* Return to Sanctuary (Mobile Icon) */}
              <button
                onClick={onBack}
                title="Back to Love Sanctuary Dashboard"
                className={`sm:hidden p-2 rounded-full ${chatTheme.accentText} hover:bg-white/10 cursor-pointer ml-0.5`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Area with Mood-Adaptive Dynamic Wallpaper */}
          <div
            className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-12 py-4 space-y-2 relative overscroll-contain transition-colors duration-700 ${
              isDarkTheme ? chatTheme.chatAreaDark : chatTheme.chatAreaLight
            }`}
          >
            {/* Dynamic Mood Wallpaper Texture Pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.07] dark:opacity-[0.05]"
              style={{
                backgroundImage: chatTheme.doodlePattern,
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            />

            {/* Date Badge */}
            <div className="flex justify-center my-3 relative z-10">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-xs uppercase tracking-wider border ${
                  isDarkTheme
                    ? 'bg-black/50 text-slate-300 border-white/10'
                    : 'bg-white/90 text-slate-700 border-slate-200'
                }`}
              >
                Today • Ashis &amp; Kirti Private Haven ({chatTheme.name})
              </span>
            </div>

            {/* Empty state */}
            {isLoading && filteredMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs opacity-70">
                Connecting to couple chat server...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center relative z-10">
                <Heart className={`w-12 h-12 mb-2 ${chatTheme.accentText} fill-current opacity-30 animate-pulse`} />
                <p className="text-sm font-bold opacity-80">
                  No messages found in chat
                </p>
                <p className="text-xs opacity-60 mt-1">
                  Type a sweet message or click any quick sentiment below!
                </p>
              </div>
            ) : (
              /* Message Bubbles Styled Dynamically by Mood */
              filteredMessages.map((msg, idx) => {
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
                      className={`max-w-[85%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-md text-xs sm:text-sm leading-relaxed relative ${
                        isMe
                          ? isDarkTheme
                            ? chatTheme.myBubbleDark
                            : chatTheme.myBubbleLight
                          : isDarkTheme
                          ? chatTheme.partnerBubbleDark
                          : chatTheme.partnerBubbleLight
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                      
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

            {/* Live Typing Animation */}
            {chatPartnerTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 relative z-10 py-1"
              >
                <div
                  className={`px-3.5 py-2 rounded-2xl rounded-tl-none text-xs font-semibold flex items-center gap-1.5 shadow-sm border ${
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
          </div>

          {/* Emoji Keyboard Popover */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`p-3 border-t max-h-48 overflow-y-auto grid grid-cols-8 sm:grid-cols-16 gap-2 shrink-0 transition-colors ${
                  isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
                }`}
              >
                {EMOJI_PALETTE.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    className="text-xl p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Love Shortcuts Horizontal Carousel */}
          <div
            className={`py-1.5 px-3 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 border-t transition-colors ${
              isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
            }`}
          >
            {QUICK_BURSTS.map((burst, idx) => (
              <motion.button
                key={idx}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendQuick(burst)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  isDarkTheme ? chatTheme.quickBurstDark : chatTheme.quickBurstLight
                }`}
              >
                {burst}
              </motion.button>
            ))}
          </div>

          {/* Bottom Chat Input Bar - Guaranteed Always Visible Above Navigation Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className={`shrink-0 w-full p-2 sm:p-3 flex items-center gap-2 border-t z-30 select-text pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-colors ${
              isDarkTheme ? chatTheme.headerDark : chatTheme.headerLight
            }`}
          >
            {/* Input pill containing Emoji Button, text input, and quick heart */}
            <div
              className={`flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-inner transition-colors ${
                isDarkTheme
                  ? 'bg-black/40 border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Romantic Emojis"
                className={`p-1.5 rounded-full cursor-pointer transition-colors shrink-0 ${
                  showEmojiPicker ? chatTheme.accentText : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Message Input Box with explicit mobile keyboard triggers */}
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
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-0 focus:outline-hidden text-sm sm:text-base placeholder:text-slate-400 select-text cursor-text min-w-0"
              />

              {/* Quick Heart Button */}
              <button
                type="button"
                onClick={() => handleSend("I love you so much ❤️")}
                title="Send Quick Heart"
                className="p-1.5 rounded-full text-rose-500 hover:text-rose-400 cursor-pointer shrink-0"
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
              className={`w-11 h-11 rounded-full text-white cursor-pointer transition-all disabled:opacity-40 flex items-center justify-center shrink-0 shadow-md ${
                text.trim() ? `${chatTheme.sendBtn}` : 'bg-slate-500 opacity-60'
              }`}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};