import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  animate,
} from 'framer-motion';
import {
  Heart,
  Calendar,
  User,
  Sparkles,
  Play,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  Layers,
  Image as ImageIcon,
  Filter,
  Flame,
  Check,
  Trash2,
  Shuffle,
  RotateCcw,
  ChevronsDown,
  ChevronsUp,
  Smartphone,
  Vibrate,
} from 'lucide-react';
import { useMemories } from '../hooks/useMemories';
import { useAuth } from '../context/AuthContext';
import { MOOD_THEMES } from '../utils/moodThemes';
import confetti from 'canvas-confetti';

import couple1 from '../assets/couples/couple1.jpg';
import couple2 from '../assets/couples/couple2.jpg';
import couple3 from '../assets/couples/couple3.jpg';
import couple4 from '../assets/couples/couple4.jpg';
import couple5 from '../assets/couples/couple5.jpg';
import couple6 from '../assets/couples/couple6.jpg';
import couple7 from '../assets/couples/couple7.jpg';
import couple8 from '../assets/couples/couple8.jpg';

// Fallback high-resolution romantic moments with real downloaded Hindi cinema couple moments
const CURATED_ROMANTIC_MOMENTS = [
  {
    _id: 'feed-curated-1',
    url: couple1,
    caption: 'Our golden hour by the shore. The ocean had nothing on the warmth in your eyes.',
    uploaderName: 'Majnu',
    date: '2020-09-10',
    likes: [{ user: 'Laila' }, { user: 'Majnu' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-2',
    url: couple2,
    caption: 'Quiet coffee dates, whispered dreams, and losing track of time together.',
    uploaderName: 'Laila',
    date: '2021-02-14',
    likes: [{ user: 'Majnu' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-3',
    url: couple3,
    caption: 'Hand in hand beneath the fairy lights. A night I would relive a thousand times.',
    uploaderName: 'Majnu',
    date: '2021-10-09',
    likes: [{ user: 'Laila' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-4',
    url: couple4,
    caption: 'Laughing so hard we couldn’t breathe. You are my purest source of joy.',
    uploaderName: 'Laila',
    date: '2022-09-10',
    likes: [{ user: 'Majnu' }, { user: 'Laila' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-5',
    url: couple5,
    caption: 'Your warmth makes every ordinary day feel like an extraordinary adventure.',
    uploaderName: 'Majnu',
    date: '2023-01-01',
    likes: [{ user: 'Laila' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-6',
    url: couple6,
    caption: 'A candid smile that melted my heart in an instant.',
    uploaderName: 'Laila',
    date: '2023-09-10',
    likes: [{ user: 'Majnu' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-7',
    url: couple7,
    caption: 'Lost in conversation under the starlit sky. Every word with you is poetry.',
    uploaderName: 'Majnu',
    date: '2024-02-14',
    likes: [{ user: 'Laila' }, { user: 'Majnu' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-8',
    url: couple8,
    caption: 'Through every season, through every high and low, holding your hand forever.',
    uploaderName: 'Laila',
    date: '2024-09-10',
    likes: [{ user: 'Majnu' }],
    mediaType: 'image',
  },
];

// =========================================================================
// GPU-ACCELERATED FRAMER MOTION SHUFFLE CARD (Direct MotionValue Transforms)
// Runs at solid 60/120fps with zero React component re-renders during scroll
// =========================================================================
const ShuffleDeckCard = ({
  mem,
  idx,
  count,
  smoothSpread,
  isMobile,
  isLiked,
  isDoubleTapped,
  isMajnu,
  theme,
  localLikesCount,
  onSelect,
  onDoubleClick,
  onDelete,
  onLike,
}) => {
  const center = (count - 1) / 2;
  const rel = idx - center;

  // 1. Fanned Arc layout values (when spread = 1)
  const fannedX = rel * (isMobile ? 48 : 112);
  const fannedY = Math.pow(Math.abs(rel), 1.25) * (isMobile ? 10 : 16);
  const fannedRot = rel * (isMobile ? 4.5 : 6);

  // 2. Stacked Deck layout values (when spread = 0)
  const stackedX = rel * 2.5;
  const stackedY = idx * -2.5;
  const stackedRot = (idx % 2 === 0 ? 1 : -1) * (idx * 0.9);

  // 3. Continuous Framer Motion Transforms (no React re-renders on scroll)
  const x = useTransform(smoothSpread, [0, 1], [stackedX, fannedX]);
  const y = useTransform(smoothSpread, [0, 1], [stackedY, fannedY]);
  const rotate = useTransform(smoothSpread, [0, 1], [stackedRot, fannedRot]);
  const scale = useTransform(
    smoothSpread,
    [0, 0.5, 1],
    [1 - idx * 0.005, 1, 1 - Math.abs(rel) * 0.012]
  );
  const fannedZ = Math.round(count - Math.abs(rel));
  const stackedZ = count - idx;
  const zIndex = useTransform(smoothSpread, (val) =>
    Math.round(fannedZ * val + stackedZ * (1 - val))
  );

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        scale,
        zIndex,
      }}
      whileHover={{
        y: fannedY - 24,
        scale: 1.08,
        rotate: 0,
        zIndex: 9999,
        transition: { duration: 0.22, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`absolute w-60 sm:w-72 md:w-80 h-84 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden cursor-pointer border-3 shadow-2xl transition-shadow select-none will-change-transform ${
        theme.isDark
          ? 'bg-slate-900 border-slate-700/80 shadow-black/80 hover:border-rose-400 hover:shadow-rose-500/30'
          : 'bg-white border-white/90 shadow-rose-950/20 hover:border-rose-300 hover:shadow-rose-500/30'
      }`}
    >
      {/* Top image section with blur backdrop */}
      <div className="relative h-[66%] w-full overflow-hidden bg-slate-950">
        <img
          src={mem.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-40 pointer-events-none"
        />
        <img
          src={mem.url}
          alt={mem.caption || 'Couple moment'}
          className="relative z-10 w-full h-full object-cover"
          loading="lazy"
        />

        {/* Glossy sheen overlay */}
        <div className="absolute inset-0 z-15 bg-gradient-to-tr from-white/15 via-transparent to-black/25 pointer-events-none" />

        {/* Uploader Pill */}
        <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20 shadow-md">
          <span
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
              isMajnu ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {mem.uploaderName ? mem.uploaderName.charAt(0) : 'L'}
          </span>
          <span>{mem.uploaderName || 'Laila & Majnu'}</span>
        </div>

        {/* Delete & Heart buttons */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={onDelete}
            title="Delete memory"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md border border-white/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={onLike}
            title={isLiked ? 'Loved' : 'Love memory'}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-700 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
          </motion.button>
        </div>

        {/* Double tap heart blast */}
        <AnimatePresence>
          {isDoubleTapped && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2.2, opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-16 h-16 fill-rose-500 text-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom caption and footer */}
      <div className="h-[34%] p-3 sm:p-4 flex flex-col justify-between bg-white dark:bg-slate-900">
        <p className={`text-xs font-serif leading-snug line-clamp-2 ${theme.headingText}`}>
          "{mem.caption || 'A timeless moment etched in our souls forever.'}"
        </p>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-rose-400" />
            {new Date(mem.date || mem.createdAt || '2020-09-10').toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1 text-rose-500 font-bold">
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-500' : ''}`} />
            <span>{(mem.likes?.length || 0) + localLikesCount} loves</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const DashboardFeed = ({ onOpenUpload }) => {
  const { dashboardFeed, isDashboardLoading, likeMemory, deleteMemory } = useMemories();
  const { user, partner, activeMoodTheme } = useAuth();
  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;

  // View Layout Modes: 'shuffle' (scroll-driven card fan/deck) | 'grid' | 'polaroid' | 'showcase'
  const [layoutMode, setLayoutMode] = useState('shuffle');

  // =========================================================================
  // Pure Framer Motion Continuous Motion Values (GPU Accelerated)
  // =========================================================================
  const rawSpread = useMotionValue(0.85);
  // Ultra-fluid Framer Motion spring physics (no frame drops)
  const smoothSpread = useSpring(rawSpread, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  // State only for display text (throttled to avoid re-renders)
  const [spreadPercent, setSpreadPercent] = useState(85);

  useMotionValueEvent(smoothSpread, 'change', (latest) => {
    const rounded = Math.round(latest * 100);
    if (Math.abs(rounded - spreadPercent) >= 3) {
      setSpreadPercent(rounded);
    }
  });

  // Framer Motion useScroll hook
  const { scrollY } = useScroll();
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useMotionValueEvent(scrollY, 'change', (currentY) => {
    const delta = currentY - lastScrollY.current;
    if (Math.abs(delta) > 2) {
      // Scrolling DOWN -> cards smoothly converge together into deck
      // Scrolling UP -> cards smoothly separate and fan out
      const step = delta * 0.0035;
      rawSpread.set(Math.max(0, Math.min(1, rawSpread.get() - step)));
      lastScrollY.current = currentY;
    }
  });

  // Trackpad or mouse wheel over deck container
  const handleDeckWheel = (e) => {
    if (Math.abs(e.deltaY) > 2) {
      const step = e.deltaY * 0.0025;
      rawSpread.set(Math.max(0, Math.min(1, rawSpread.get() - step)));
    }
  };

  // Touch swipe gestures
  const touchStartY = useRef(0);
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchY;
      if (Math.abs(deltaY) > 2) {
        const step = deltaY * 0.0035;
        rawSpread.set(Math.max(0, Math.min(1, rawSpread.get() - step)));
        touchStartY.current = touchY;
      }
    }
  };

  // Smooth Framer Motion animate() controls
  const handleFanOut = () => {
    animate(rawSpread, 1, { duration: 0.65, ease: [0.16, 1, 0.3, 1] });
  };

  const handleStackDeck = () => {
    animate(rawSpread, 0, { duration: 0.65, ease: [0.16, 1, 0.3, 1] });
  };

  // Interactive Shuffle Deck Order & Mobile Shake-to-Shuffle state
  const [isDeckShuffling, setIsDeckShuffling] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [shakeToast, setShakeToast] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const deckContainerRef = useRef(null);
  const lastShakeTimeRef = useRef(0);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });

  // Unified Shake and Shuffle Trigger with Framer Motion spring physics
  const triggerShuffleWithShake = useCallback((source = 'button') => {
    if (isDeckShuffling) return;
    setIsDeckShuffling(true);
    setIsShaking(true);

    // Haptic vibration feedback on mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([45, 30, 60]);
      } catch (_) {}
    }

    if (source === 'shake') {
      setShakeToast(true);
      setTimeout(() => setShakeToast(false), 2600);
    }

    // 1. First animate cards into center stack with playful shake flutter
    animate(rawSpread, 0.05, { duration: 0.22, ease: 'easeInOut' }).then(() => {
      confetti({
        particleCount: 55,
        spread: 90,
        origin: { x: 0.5, y: 0.55 },
        colors: ['#f43f5e', '#ec4899', '#fb7185', '#fbbf24', '#a855f7'],
      });

      // 2. Randomize order
      const len = filteredMemories.length;
      const indices = Array.from({ length: len }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);

      // 3. Smoothly fan back out with Framer Motion spring
      setTimeout(() => {
        animate(rawSpread, 0.9, { duration: 0.72, ease: [0.16, 1, 0.3, 1] });
        setIsDeckShuffling(false);
        setIsShaking(false);
      }, 160);
    });
  }, [isDeckShuffling, filteredMemories.length, rawSpread]);

  const handleShuffleCards = () => {
    triggerShuffleWithShake('button');
  };

  // Mobile Device Shake Detection (Accelerometer DeviceMotionEvent API)
  useEffect(() => {
    const SHAKE_THRESHOLD = 17; // Acceleration delta threshold (m/s^2)
    const COOLDOWN_MS = 1500;   // Cooldown between shake triggers

    const handleDeviceMotion = (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;

      const now = Date.now();
      if (now - lastShakeTimeRef.current < COOLDOWN_MS) return;

      const curX = acc.x || 0;
      const curY = acc.y || 0;
      const curZ = acc.z || 0;

      const deltaX = Math.abs(curX - lastAccelRef.current.x);
      const deltaY = Math.abs(curY - lastAccelRef.current.y);
      const deltaZ = Math.abs(curZ - lastAccelRef.current.z);

      lastAccelRef.current = { x: curX, y: curY, z: curZ };

      // Total acceleration delta across all 3 axes
      if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
        lastShakeTimeRef.current = now;
        triggerShuffleWithShake('shake');
      }
    };

    if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, [triggerShuffleWithShake]);

  // Request shake permission on iOS 13+ if required, or execute shake test
  const handleEnableShakeMotion = async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const res = await DeviceMotionEvent.requestPermission();
        if (res === 'granted') {
          triggerShuffleWithShake('shake');
        } else {
          triggerShuffleWithShake('shake');
        }
      } catch (err) {
        triggerShuffleWithShake('shake');
      }
    } else {
      triggerShuffleWithShake('shake');
    }
  };

  // Framing Mode: 'cover' (aesthetic fill) | 'contain' (full photo with bokeh backdrop)
  const [fitMode, setFitMode] = useState('cover');
  // Filter by Uploader
  const [filterUploader, setFilterUploader] = useState('all'); // 'all' | 'majnu' | 'laila'

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [doubleClickedId, setDoubleClickedId] = useState(null);
  const [localLikedIds, setLocalLikedIds] = useState(new Set());
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedLocalIds, setDeletedLocalIds] = useState(new Set());

  // Screen width observer for responsive card fan arc
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Merge server feed with curated moments if feed has few items
  const combinedMemories = [
    ...(dashboardFeed || []),
    ...(dashboardFeed && dashboardFeed.length < 3 ? CURATED_ROMANTIC_MOMENTS : []),
  ];

  // Deduplicate and exclude locally deleted memories
  const uniqueMemories = Array.from(
    new Map(
      combinedMemories
        .filter((m) => !deletedLocalIds.has(m._id))
        .map((m) => [m._id, m])
    ).values()
  );

  // Filter memories (supporting both Majnu and Laila)
  const filteredMemories = uniqueMemories.filter((mem) => {
    if (filterUploader === 'all') return true;
    const name = mem.uploaderName?.toLowerCase() || '';
    if (filterUploader === 'majnu' || filterUploader === 'ashis') {
      return name === 'majnu' || name === 'ashis';
    }
    if (filterUploader === 'laila' || filterUploader === 'kirti') {
      return name === 'laila' || name === 'kirti';
    }
    return name === filterUploader.toLowerCase();
  });

  const selectedMedia = selectedMediaIndex !== null ? filteredMemories[selectedMediaIndex] : null;

  // Delete Memory Handlers
  const handleDeleteClick = (mem, e) => {
    if (e) e.stopPropagation();
    setImageToDelete(mem);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      setIsDeleting(true);
      const id = imageToDelete._id;
      setDeletedLocalIds((prev) => new Set(prev).add(id));

      if (id && /^[0-9a-fA-F]{24}$/.test(id) && deleteMemory) {
        await deleteMemory(id);
      }

      if (selectedMediaIndex !== null) {
        setSelectedMediaIndex(null);
      }
      setImageToDelete(null);
    } catch (err) {
      console.error('Delete memory error:', err);
    } finally {
      setIsDeleting(false);
      setImageToDelete(null);
    }
  };

  // Like Memory with Celebratory Confetti
  const handleLike = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setLocalLikedIds((prev) => new Set(prev).add(id));
      if (likeMemory) {
        await likeMemory(id);
      }
      confetti({
        particleCount: 30,
        spread: 60,
        origin: e
          ? {
              x: e.clientX / window.innerWidth,
              y: e.clientY / window.innerHeight,
            }
          : { x: 0.5, y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#fbbf24', '#34d399', '#ec4899'],
      });
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDoubleClick = (mem, e) => {
    if (e) e.stopPropagation();
    setDoubleClickedId(mem._id);
    handleLike(mem._id, e);
    setTimeout(() => setDoubleClickedId(null), 900);
  };

  // Keyboard navigation for Lightbox
  const handleNextMedia = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (selectedMediaIndex !== null && selectedMediaIndex < filteredMemories.length - 1) {
        setSelectedMediaIndex((prev) => prev + 1);
      } else {
        setSelectedMediaIndex(0); // Loop to start
      }
    },
    [selectedMediaIndex, filteredMemories.length]
  );

  const handlePrevMedia = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (selectedMediaIndex !== null && selectedMediaIndex > 0) {
        setSelectedMediaIndex((prev) => prev - 1);
      } else {
        setSelectedMediaIndex(filteredMemories.length - 1); // Loop to end
      }
    },
    [selectedMediaIndex, filteredMemories.length]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedMediaIndex === null) return;
      if (e.key === 'ArrowRight') handleNextMedia();
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'Escape') setSelectedMediaIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMediaIndex, handleNextMedia, handlePrevMedia]);

  return (
    <div className="space-y-6 select-none">
      {/* ========================================================= */}
      {/* SECTION HEADER: Title, Layout Switches & Filter Pills */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className={`text-xl sm:text-2xl font-serif font-black tracking-tight transition-colors duration-700 ${theme.headingText}`}>
              Our Shared Memories
            </h2>
            <motion.span
              animate={activeMoodTheme === 'happy' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`text-[11px] font-bold px-3 py-0.5 rounded-full border transition-all duration-700 ${theme.moodTagBg} flex items-center gap-1`}
            >
              <span>{theme.emoji}</span>
              <span>{theme.moodTag}</span>
            </motion.span>
          </div>
          <p className={`text-xs sm:text-sm font-serif italic transition-colors duration-700 ${theme.subText}`}>
            Every smile, touch, and adventure captured for eternity between Laila &amp; Majnu.
          </p>
        </div>

        {/* Action Controls: Fit Mode, Layout Mode & Add Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Uploader Filter Tabs */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilterUploader('all')}
              className={`px-2.5 py-1 rounded-xl cursor-pointer transition-colors ${
                filterUploader === 'all'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUploader('majnu')}
              className={`px-2.5 py-1 rounded-xl cursor-pointer transition-colors flex items-center gap-1 ${
                filterUploader === 'majnu' || filterUploader === 'ashis'
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Majnu</span>
            </button>
            <button
              onClick={() => setFilterUploader('laila')}
              className={`px-2.5 py-1 rounded-xl cursor-pointer transition-colors flex items-center gap-1 ${
                filterUploader === 'laila' || filterUploader === 'kirti'
                  ? 'bg-white dark:bg-slate-800 text-pink-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>Laila</span>
            </button>
          </div>

          {/* Layout Switcher (Shuffle Deck vs Grid vs Polaroid vs Showcase) */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setLayoutMode('shuffle')}
              title="Scroll Card Shuffle Deck (Scroll down: stacks deck • Scroll up: separates images)"
              className={`px-2.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                layoutMode === 'shuffle'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold hidden sm:inline">Shuffle Deck</span>
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              title="Modern Romantic Grid"
              className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('polaroid')}
              title="Polaroid Scrapbook Style"
              className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                layoutMode === 'polaroid'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('showcase')}
              title="Magazine Showcase View"
              className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                layoutMode === 'showcase'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* New Memory Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenUpload}
            className={`px-3.5 py-1.5 rounded-2xl bg-gradient-to-r ${theme.primaryBtn} text-white text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* FEED CONTENT: Dynamic Layouts with High-Fidelity Images */}
      {/* ========================================================= */}
      {isDashboardLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-88 animate-pulse rounded-3xl ${
                theme.isDark ? 'bg-slate-900/60 border border-slate-800' : 'bg-white/60 border border-rose-100'
              }`}
            />
          ))}
        </div>
      ) : filteredMemories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-10 text-center flex flex-col items-center justify-center rounded-3xl transition-all duration-700 ${theme.cardBg}`}
        >
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
            <Heart className="w-8 h-8 fill-rose-400" />
          </div>
          <h3 className={`text-base font-bold transition-colors ${theme.headingText}`}>
            No memories found for {filterUploader}
          </h3>
          <p className={`text-xs max-w-sm mt-1 mb-4 transition-colors ${theme.subText}`}>
            Upload a sweet memory or switch filter to see our complete love collection.
          </p>
          <button
            onClick={() => setFilterUploader('all')}
            className={`px-4 py-2 rounded-full bg-gradient-to-r ${theme.primaryBtn} text-white font-semibold text-xs shadow-md cursor-pointer`}
          >
            Show All Memories
          </button>
        </motion.div>
      ) : (
        /* ======================================================= */
        /* 0. INTERACTIVE SCROLL CARD SHUFFLE DECK (Scroll down: stacks deck, Scroll up: separates images) */
        /* ======================================================= */
        layoutMode === 'shuffle' ? (
          <div
            ref={deckContainerRef}
            onWheel={handleDeckWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="flex flex-col items-center select-none w-full py-2 space-y-4"
          >
            {/* Top Interactive Banner & Live Scroll Instruction Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-rose-200/60 dark:border-white/10 shadow-lg"
            >
              {/* Dynamic State Pill with Live Scroll Instruction */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${
                    spreadPercent < 35
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300'
                  } shadow-xs transition-colors`}
                >
                  <Shuffle className={`w-5 h-5 ${isDeckShuffling ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-serif text-slate-900 dark:text-white">
                      {spreadPercent < 30
                        ? '📦 Deck Stacked Together'
                        : spreadPercent > 70
                        ? '✨ Cards Separated & Fanned Out'
                        : '💫 Transitioning Cards'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-slate-800 text-rose-500 border border-rose-200/60 dark:border-slate-700">
                      {spreadPercent}% Fan Spread
                    </span>
                  </div>
                  <p className="text-xs font-serif italic text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    {spreadPercent < 35 ? (
                      <>
                        <ChevronsUp className="w-4 h-4 text-rose-500 animate-bounce" />
                        <span>Scroll <b>UP</b> to fan out and separate all images</span>
                      </>
                    ) : (
                      <>
                        <ChevronsDown className="w-4 h-4 text-rose-500 animate-bounce" />
                        <span>Scroll <b>DOWN</b> to gather cards into a stacked deck</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Fan Out, Stack Deck, Shuffle Cards */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleFanOut}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    spreadPercent >= 80
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-black/10'
                  }`}
                  title="Separate all images into a curved fan"
                >
                  Fan Out
                </button>
                <button
                  type="button"
                  onClick={handleStackDeck}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    spreadPercent <= 20
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-black/10'
                  }`}
                  title="Stack all images into a single deck"
                >
                  Stack Deck
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleEnableShakeMotion}
                  disabled={isDeckShuffling}
                  className={`px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5 ${
                    isShaking ? 'ring-2 ring-amber-300 animate-pulse' : ''
                  }`}
                  title="Shake your phone to shuffle cards, or tap to trigger shake!"
                >
                  <Smartphone className={`w-3.5 h-3.5 ${isShaking ? 'animate-bounce' : ''}`} />
                  <span>{isMobile ? 'Shake 📳' : 'Shake & Shuffle'}</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Shake Detection Toast Popup */}
            <AnimatePresence>
              {shakeToast && (
                <motion.div
                  initial={{ opacity: 0, y: -25, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="fixed top-20 left-1/2 -translate-x-1/2 z-[999999] px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/30 backdrop-blur-md pointer-events-none"
                >
                  <Smartphone className="w-4 h-4 animate-bounce text-amber-200" />
                  <span>📳 Phone Shaken! Cards Shuffled with Love 💕</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The 3D Interactive Card Deck Stage with Framer Motion Shake wobble */}
            <motion.div
              animate={isShaking ? {
                x: [-12, 12, -9, 9, -5, 5, 0],
                rotate: [-2.5, 2.5, -1.8, 1.8, -0.8, 0.8, 0],
                transition: { duration: 0.38, ease: 'easeInOut' },
              } : {}}
              className="relative w-full h-[520px] sm:h-[560px] md:h-[600px] flex items-center justify-center overflow-visible my-2"
            >
              {(shuffledIndices && shuffledIndices.length === filteredMemories.length
                ? shuffledIndices.map((i) => filteredMemories[i])
                : filteredMemories
              ).map((mem, idx, arr) => {
                const isLiked =
                  localLikedIds.has(mem._id) ||
                  mem.likes?.some((l) => l.user === user?.displayName);
                const isDoubleTapped = doubleClickedId === mem._id;
                const isMajnu =
                  mem.uploaderName?.toLowerCase() === 'majnu' ||
                  mem.uploaderName?.toLowerCase() === 'ashis';
                const originalIndex = filteredMemories.findIndex((m) => m._id === mem._id);

                return (
                  <ShuffleDeckCard
                    key={mem._id}
                    mem={mem}
                    idx={idx}
                    count={arr.length}
                    smoothSpread={smoothSpread}
                    isMobile={isMobile}
                    isLiked={isLiked}
                    isDoubleTapped={isDoubleTapped}
                    isMajnu={isMajnu}
                    theme={theme}
                    localLikesCount={localLikedIds.has(mem._id) ? 1 : 0}
                    onSelect={() => setSelectedMediaIndex(originalIndex >= 0 ? originalIndex : idx)}
                    onDoubleClick={(e) => handleDoubleClick(mem, e)}
                    onDelete={(e) => handleDeleteClick(mem, e)}
                    onLike={(e) => handleLike(mem._id, e)}
                  />
                );
              })}
            </motion.div>
          </div>
        ) : /* ======================================================= */
        /* 1. ROMANTIC MODERN GRID LAYOUT */
        /* ======================================================= */
        layoutMode === 'grid' ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMemories.map((mem, idx) => {
              const isLiked =
                localLikedIds.has(mem._id) ||
                mem.likes?.some((l) => l.user === user?.displayName);
              const isDoubleTapped = doubleClickedId === mem._id;
              const isMajnu = mem.uploaderName?.toLowerCase() === 'majnu' || mem.uploaderName?.toLowerCase() === 'ashis';

              return (
                <motion.div
                  key={mem._id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
                  }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMediaIndex(idx)}
                  onDoubleClick={(e) => handleDoubleClick(mem, e)}
                  className={`group transition-all duration-500 flex flex-col cursor-pointer overflow-hidden rounded-[2.2rem] border-2 shadow-xl ${
                    theme.isDark
                      ? 'bg-slate-900/90 border-slate-700/80 shadow-black/40 hover:border-rose-500/50 hover:shadow-rose-500/20'
                      : 'bg-white/95 border-rose-100/90 shadow-rose-500/10 hover:border-rose-300 hover:shadow-rose-500/25'
                  }`}
                >
                  {/* Image Frame with Double-Layered Bokeh Backdrop */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                    {/* Blurred Background Replica for Wide/Tall Photos */}
                    <img
                      src={mem.url}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-xl scale-115 opacity-40 pointer-events-none"
                    />

                    {/* Main Image with Smooth Subtle Zoom on Hover */}
                    {mem.mediaType === 'video' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video src={mem.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-xl">
                            <Play className="w-5 h-5 ml-1 fill-rose-600" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={mem.url}
                        alt={mem.caption || 'Memory'}
                        className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                        loading="lazy"
                      />
                    )}

                    {/* Shimmer Light pass on hover */}
                    <div className="absolute inset-0 z-10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                    {/* Top Left: Uploader Pill with Initials Avatar */}
                    <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20 shadow-md">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isMajnu ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {mem.uploaderName ? mem.uploaderName.charAt(0) : 'L'}
                      </span>
                      <span>{mem.uploaderName || 'Laila & Majnu'}</span>
                    </div>

                    {/* Top Right: Delete & Love Heart Buttons */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleDeleteClick(mem, e)}
                        title="Delete memory"
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer shadow-lg border border-white/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleLike(mem._id, e)}
                        title={isLiked ? 'Loved by you' : 'Love this memory'}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-rose-500/40 ring-2 ring-white/50'
                            : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-white stroke-white' : ''}`} />
                      </motion.button>
                    </div>

                    {/* Fullscreen Expand Icon on Hover */}
                    <div className="absolute bottom-3 right-3 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Floating Heart Wave on Double Tap */}
                    <AnimatePresence>
                      {isDoubleTapped && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1.4, opacity: 1 }}
                          exit={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                        >
                          <Heart className="w-20 h-20 fill-rose-500 text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Card Details & Caption */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {mem.caption ? (
                        <p className={`text-xs sm:text-sm font-serif leading-relaxed line-clamp-3 ${theme.headingText}`}>
                          "{mem.caption}"
                        </p>
                      ) : (
                        <p className={`text-xs italic opacity-75 ${theme.subText}`}>
                          A silent, cherished moment between Laila &amp; Majnu
                        </p>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-200 font-semibold">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        {new Date(mem.date || mem.createdAt || '2020-09-10').toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <span className="flex items-center gap-1 font-bold text-rose-500">
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                        <span>{(mem.likes?.length || 0) + (localLikedIds.has(mem._id) ? 1 : 0)} loves</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : /* ======================================================= */
        /* 2. POLAROID SCRAPBOOK STYLE LAYOUT */
        /* ======================================================= */
        layoutMode === 'polaroid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
            {filteredMemories.map((mem, idx) => {
              const isLiked =
                localLikedIds.has(mem._id) ||
                mem.likes?.some((l) => l.user === user?.displayName);
              const rotation = idx % 3 === 0 ? '-rotate-1' : idx % 3 === 1 ? 'rotate-2' : '-rotate-2';

              return (
                <motion.div
                  key={mem._id}
                  whileHover={{ scale: 1.05, rotate: 0, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMediaIndex(idx)}
                  onDoubleClick={(e) => handleDoubleClick(mem, e)}
                  className={`cursor-pointer transition-all duration-300 p-3.5 pb-6 rounded-2xl bg-white shadow-2xl border-4 border-white ${rotation} group hover:z-20`}
                >
                  {/* Top Scotch Tape Simulation */}
                  <div className="w-20 h-5 bg-amber-100/70 border border-amber-200/50 backdrop-blur-xs mx-auto -mt-6 mb-2 rounded-xs shadow-xs -rotate-2" />

                  {/* Photo Square Frame */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                    <img
                      src={mem.url}
                      alt={mem.caption}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />

                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleDeleteClick(mem, e)}
                        title="Delete memory"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md cursor-pointer transition-colors shadow-md border border-white/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => handleLike(mem._id, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-md cursor-pointer ${
                          isLiked ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-700'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Handwritten Polaroid Caption */}
                  <div className="mt-3.5 px-2 text-center text-slate-800">
                    <p className="font-serif italic text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      "{mem.caption || 'A perfect love memory'}"
                    </p>
                    <div className="mt-2 text-[10px] uppercase tracking-wider text-rose-500 font-bold">
                      {mem.uploaderName} •{' '}
                      {new Date(mem.date || mem.createdAt || '2020-09-10').toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* ======================================================= */
          /* 3. MAGAZINE SHOWCASE STREAM LAYOUT */
          /* ======================================================= */
          <div className="space-y-6">
            {filteredMemories.map((mem, idx) => {
              const isLiked =
                localLikedIds.has(mem._id) ||
                mem.likes?.some((l) => l.user === user?.displayName);

              return (
                <motion.div
                  key={mem._id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedMediaIndex(idx)}
                  className={`group rounded-3xl overflow-hidden border-2 transition-all cursor-pointer grid grid-cols-1 md:grid-cols-12 shadow-xl ${
                    theme.isDark
                      ? 'bg-slate-900/90 border-slate-700/80'
                      : 'bg-white border-rose-100'
                  }`}
                >
                  <div className="md:col-span-7 h-64 sm:h-80 md:h-96 relative overflow-hidden bg-black">
                    <img
                      src={mem.url}
                      alt={mem.caption}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md">
                      {mem.uploaderName}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(mem, e)}
                      title="Delete memory"
                      className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md border border-white/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest block mb-2">
                        Laila ❤️ Majnu Chronicle
                      </span>
                      <h3 className={`text-base sm:text-xl font-serif font-black leading-snug mb-3 ${theme.headingText}`}>
                        "{mem.caption || 'Our journey of holding hands and loving unconditionally.'}"
                      </h3>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(mem.date || mem.createdAt || '2020-09-10').toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleLike(mem._id, e)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                          isLiked
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                        <span>{(mem.likes?.length || 0) + (localLikedIds.has(mem._id) ? 1 : 0)} Loves</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      )}

      {/* ========================================================= */}
      {/* HIGH-FIDELITY ROMANTIC LIGHTBOX MODAL WITH SEQUENTIAL BROWSING */}
      {/* ========================================================= */}
      {typeof document !== 'undefined' &&
        selectedMedia &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMediaIndex(null)}
              className="fixed inset-0 z-[999000] flex items-center justify-center p-3 sm:p-6 bg-black/94 backdrop-blur-2xl select-none"
            >
              {/* Previous Image Button */}
              <motion.button
                whileHover={{ scale: 1.2, x: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevMedia}
                title="Previous photo (Left Arrow)"
                className="absolute left-2 sm:left-6 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 cursor-pointer shadow-2xl transition-all"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </motion.button>

              {/* Next Image Button */}
              <motion.button
                whileHover={{ scale: 1.2, x: 3 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextMedia}
                title="Next photo (Right Arrow)"
                className="absolute right-2 sm:right-6 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 cursor-pointer shadow-2xl transition-all"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </motion.button>

              <motion.div
                key={selectedMedia._id}
                initial={{ scale: 0.88, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl max-h-[92vh] w-full flex flex-col items-center justify-center"
              >
                {/* Top Controls Bar: Counter, Love Button & Close */}
                <div className="w-full flex items-center justify-between mb-2 sm:mb-3 px-2 text-white">
                  <span className="text-xs font-semibold text-rose-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    Photo {selectedMediaIndex + 1} of {filteredMemories.length}
                  </span>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDeleteClick(selectedMedia, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold border border-rose-400/30 shadow-lg cursor-pointer transition-colors"
                      title="Delete this memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete Memory</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleLike(selectedMedia._id, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      <span>Love Memory</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedMediaIndex(null)}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Main Lightbox Frame */}
                <div className="relative rounded-3xl overflow-hidden max-h-[72vh] bg-black shadow-2xl border-2 border-white/20 flex items-center justify-center">
                  {selectedMedia.mediaType === 'video' ? (
                    <video src={selectedMedia.url} controls autoPlay className="max-h-[72vh] w-auto rounded-3xl" />
                  ) : (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.caption || 'Memory'}
                      className="max-h-[72vh] w-auto object-contain rounded-3xl"
                    />
                  )}
                </div>

                {/* Caption & Metadata in Lightbox */}
                {selectedMedia.caption && (
                  <div className="mt-3 text-center px-4 max-w-xl">
                    <p className="text-rose-100 text-sm sm:text-base font-serif italic drop-shadow-md">
                      "{selectedMedia.caption}"
                    </p>
                    <p className="text-xs text-rose-300/80 mt-1">
                      Captured by {selectedMedia.uploaderName} • Laila &amp; Majnu Love Chronicle
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

      {/* Confirmation Modal for Delete (Portaled to document.body on top of everything) */}
      {typeof document !== 'undefined' &&
        imageToDelete &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setImageToDelete(null)}
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-sm w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-800 shadow-2xl text-center"
              >
                <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-500 mx-auto flex items-center justify-center mb-3">
                  <Trash2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                  Delete Memory?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                  {imageToDelete.caption ? `"${imageToDelete.caption}"` : 'This romantic memory'} will be permanently removed from our shared space.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setImageToDelete(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-500/30 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Yes, Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};