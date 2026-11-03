import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useMemories } from '../hooks/useMemories';
import { useAuth } from '../context/AuthContext';
import { MOOD_THEMES } from '../utils/moodThemes';
import confetti from 'canvas-confetti';

// Fallback high-resolution romantic moments if feed needs more memories
const CURATED_ROMANTIC_MOMENTS = [
  {
    _id: 'feed-curated-1',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85',
    caption: 'Our golden hour by the shore. The ocean had nothing on the warmth in your eyes.',
    uploaderName: 'Ashis',
    date: '2020-09-10',
    likes: [{ user: 'Kirti' }, { user: 'Ashis' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-2',
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=85',
    caption: 'Quiet coffee dates, whispered dreams, and losing track of time together.',
    uploaderName: 'Kirti',
    date: '2021-02-14',
    likes: [{ user: 'Ashis' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-3',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
    caption: 'Hand in hand beneath the fairy lights. A night I would relive a thousand times.',
    uploaderName: 'Ashis',
    date: '2021-10-09',
    likes: [{ user: 'Kirti' }],
    mediaType: 'image',
  },
  {
    _id: 'feed-curated-4',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=85',
    caption: 'Laughing so hard we couldn’t breathe. You are my purest source of joy.',
    uploaderName: 'Kirti',
    date: '2022-09-10',
    likes: [{ user: 'Ashis' }, { user: 'Kirti' }],
    mediaType: 'image',
  },
];

export const DashboardFeed = ({ onOpenUpload }) => {
  const { dashboardFeed, isDashboardLoading, likeMemory } = useMemories();
  const { user, partner, activeMoodTheme } = useAuth();
  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;

  // View Layout Modes: 'grid' (aesthetic cards) | 'polaroid' (scrapbook) | 'showcase' (cinematic magazine)
  const [layoutMode, setLayoutMode] = useState('grid');
  // Framing Mode: 'cover' (aesthetic fill) | 'contain' (full photo with bokeh backdrop)
  const [fitMode, setFitMode] = useState('cover');
  // Filter by Uploader
  const [filterUploader, setFilterUploader] = useState('all'); // 'all' | 'ashis' | 'kirti'

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [doubleClickedId, setDoubleClickedId] = useState(null);
  const [localLikedIds, setLocalLikedIds] = useState(new Set());

  // Merge server feed with curated moments if feed has few items
  const combinedMemories = [
    ...(dashboardFeed || []),
    ...(dashboardFeed && dashboardFeed.length < 3 ? CURATED_ROMANTIC_MOMENTS : []),
  ];

  // Deduplicate
  const uniqueMemories = Array.from(
    new Map(combinedMemories.map((m) => [m._id, m])).values()
  );

  // Filter memories
  const filteredMemories = uniqueMemories.filter((mem) => {
    if (filterUploader === 'all') return true;
    return mem.uploaderName?.toLowerCase() === filterUploader.toLowerCase();
  });

  const selectedMedia = selectedMediaIndex !== null ? filteredMemories[selectedMediaIndex] : null;

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
            Every smile, touch, and adventure captured for eternity between Ashis &amp; Kirti.
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
              onClick={() => setFilterUploader('ashis')}
              className={`px-2.5 py-1 rounded-xl cursor-pointer transition-colors flex items-center gap-1 ${
                filterUploader === 'ashis'
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Ashis</span>
            </button>
            <button
              onClick={() => setFilterUploader('kirti')}
              className={`px-2.5 py-1 rounded-xl cursor-pointer transition-colors flex items-center gap-1 ${
                filterUploader === 'kirti'
                  ? 'bg-white dark:bg-slate-800 text-pink-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>Kirti</span>
            </button>
          </div>

          {/* Layout Switcher (Grid vs Polaroid vs Showcase) */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-2xl text-xs font-bold">
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
              const isAshis = mem.uploaderName?.toLowerCase() === 'ashis';

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
                          isAshis ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {mem.uploaderName ? mem.uploaderName.charAt(0) : 'L'}
                      </span>
                      <span>{mem.uploaderName || 'Ashis & Kirti'}</span>
                    </div>

                    {/* Top Right: Love Heart Button with Tactile Animation */}
                    <motion.button
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => handleLike(mem._id, e)}
                      title={isLiked ? 'Loved by you' : 'Love this memory'}
                      className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-rose-500/40 ring-2 ring-white/50'
                          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-white stroke-white' : ''}`} />
                    </motion.button>

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
                          A silent, cherished moment between Ashis &amp; Kirti
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

                    <div className="absolute top-2 right-2">
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
                  </div>

                  <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest block mb-2">
                        Ashis ❤️ Kirti Chronicle
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
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMediaIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/94 backdrop-blur-2xl select-none"
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
                    Captured by {selectedMedia.uploaderName} • Ashis &amp; Kirti Love Chronicle
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};