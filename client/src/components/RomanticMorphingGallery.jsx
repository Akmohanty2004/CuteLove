import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Play,
  Pause,
  Calendar,
  User,
  X,
  Orbit,
  RotateCw,
  Eye,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Infinity as InfinityIcon,
  Compass,
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  AlertCircle,
  Move,
  Flame,
} from 'lucide-react';
import { useMemories } from '../hooks/useMemories';
import { useAuth } from '../context/AuthContext';
import { MOOD_THEMES } from '../utils/moodThemes';
import confetti from 'canvas-confetti';

// 6 distinct artistic shapes with glowing borders for revolving memories
const SHAPES = [
  {
    id: 'heart-petal',
    name: 'Blossom Petal',
    clipClass: 'rounded-[60%_40%_30%_70%/60%_30%_70%_40%]',
    borderStyle: 'border-2 border-rose-300 shadow-rose-500/40 ring-2 ring-rose-400/50',
    glowColor: 'rgba(244, 63, 94, 0.45)',
  },
  {
    id: 'arch-portal',
    name: 'Cathedral Arch',
    clipClass: 'rounded-t-full rounded-b-3xl',
    borderStyle: 'border-2 border-amber-300 shadow-amber-500/40 ring-2 ring-amber-400/50',
    glowColor: 'rgba(251, 191, 36, 0.45)',
  },
  {
    id: 'diamond-gem',
    name: 'Diamond Facet',
    clipClass: 'rounded-[2.4rem] rotate-3 hover:rotate-0 transition-transform duration-500',
    borderStyle: 'border-2 border-emerald-300 shadow-emerald-500/40 ring-2 ring-emerald-400/50',
    glowColor: 'rgba(52, 211, 153, 0.45)',
  },
  {
    id: 'zen-pebble',
    name: 'Zen Pebble',
    clipClass: 'rounded-[40%_60%_70%_30%/40%_50%_60%_50%]',
    borderStyle: 'border-2 border-cyan-300 shadow-cyan-500/40 ring-2 ring-cyan-400/50',
    glowColor: 'rgba(56, 189, 248, 0.45)',
  },
  {
    id: 'locket-oval',
    name: 'Vintage Locket',
    clipClass: 'rounded-full aspect-[4/5]',
    borderStyle: 'border-2 border-pink-300 shadow-pink-500/40 ring-2 ring-pink-400/50',
    glowColor: 'rgba(236, 72, 153, 0.45)',
  },
  {
    id: 'flower-crest',
    name: 'Flora Crest',
    clipClass: 'rounded-[2.8rem_1rem_2.8rem_1rem] -rotate-3 hover:rotate-0 transition-transform duration-500',
    borderStyle: 'border-2 border-purple-300 shadow-purple-500/40 ring-2 ring-purple-400/50',
    glowColor: 'rgba(168, 85, 247, 0.45)',
  },
];

// Fallback high-res romantic moments
const INITIAL_FALLBACK_MEMORIES = [
  {
    _id: 'sample-1',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80',
    caption: 'Our sunset walk by the shore. The golden sky had nothing on your smile.',
    uploaderName: 'Ashis',
    date: '2020-09-10',
  },
  {
    _id: 'sample-2',
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1000&q=80',
    caption: 'Cozy coffee dates and endless conversations about our dreams.',
    uploaderName: 'Kirti',
    date: '2021-02-14',
  },
  {
    _id: 'sample-3',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
    caption: 'Holding hands under fairy lights. A magical night forever etched in our hearts.',
    uploaderName: 'Ashis',
    date: '2021-10-09',
  },
  {
    _id: 'sample-4',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=80',
    caption: 'Laughing until our stomachs hurt in the autumn rain.',
    uploaderName: 'Kirti',
    date: '2022-09-10',
  },
  {
    _id: 'sample-5',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    caption: 'Your warmth makes every ordinary day feel like an extraordinary adventure.',
    uploaderName: 'Ashis',
    date: '2023-01-01',
  },
  {
    _id: 'sample-6',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    caption: 'A candid smile that melted my heart in an instant.',
    uploaderName: 'Kirti',
    date: '2023-09-10',
  },
];

const ROMANTIC_WHISPERS = [
  "Ashis's world revolves around Kirti ❤️",
  'Two souls dancing in the eternal cosmos ✨',
  'In Love Since 10/09/2020 • Forever & Always 💍',
  'Every orbit brings us closer together 🌹',
  'Ashis & Kirti • One Heartbeat, Two People 💕',
];

export const RomanticMorphingGallery = () => {
  const { dashboardFeed, vaultMemories, uploadMemory, deleteMemory, isUploading } = useMemories();
  const { user, partner, activeMoodTheme } = useAuth();
  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const arenaRef = useRef(null);

  // View modes: 'orbit' (3D revolving solar system) | 'floating' (zero-G floating stars) | 'stream' (infinite counter-glider)
  const [viewMode, setViewMode] = useState('orbit');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 0.5 (gentle), 1 (normal), 1.8 (rush)
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);

  // 3D Tilt perspective state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Drag rotation state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);

  // Couple Whispers rotation
  const [whisperIdx, setWhisperIdx] = useState(0);

  // Add / Remove Image States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [addMode, setAddMode] = useState('file'); // 'file' | 'url'
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newUploader, setNewUploader] = useState(user?.displayName || 'Ashis');
  const [addFeedback, setAddFeedback] = useState('');
  const fileInputRef = useRef(null);

  // Local storage for user-added URL images and hidden/deleted image IDs
  const [localAddedMemories, setLocalAddedMemories] = useState(() => {
    try {
      const saved = localStorage.getItem('ashis_kirti_custom_3d_memories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [removedImageIds, setRemovedImageIds] = useState(() => {
    try {
      const saved = localStorage.getItem('ashis_kirti_hidden_3d_memories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Responsive arena dimensions
  const [arenaWidth, setArenaWidth] = useState(700);

  useEffect(() => {
    const handleResize = () => {
      if (arenaRef.current) {
        setArenaWidth(arenaRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save added and removed memories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ashis_kirti_custom_3d_memories', JSON.stringify(localAddedMemories));
    } catch (e) {
      console.error(e);
    }
  }, [localAddedMemories]);

  useEffect(() => {
    try {
      localStorage.setItem('ashis_kirti_hidden_3d_memories', JSON.stringify(removedImageIds));
    } catch (e) {
      console.error(e);
    }
  }, [removedImageIds]);

  // Cycle romantic whispers every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setWhisperIdx((prev) => (prev + 1) % ROMANTIC_WHISPERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Combine real user memories, custom added, and fallbacks (excluding removed IDs)
  const allImages = [
    ...(localAddedMemories || []),
    ...(dashboardFeed || []),
    ...(vaultMemories || []),
  ];

  // Deduplicate by _id
  const uniqueMemoryMap = new Map();
  allImages.forEach((img) => {
    if (img && img._id && !removedImageIds.includes(img._id)) {
      uniqueMemoryMap.set(img._id, img);
    }
  });

  INITIAL_FALLBACK_MEMORIES.forEach((sample) => {
    if (!removedImageIds.includes(sample._id) && !uniqueMemoryMap.has(sample._id)) {
      uniqueMemoryMap.set(sample._id, sample);
    }
  });

  const galleryItems = Array.from(uniqueMemoryMap.values());

  // Web Audio crystalline celestial chime
  const playCelestialChime = (freq = 659.25) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio not permitted or suspended
    }
  };

  // Continuous 3D orbit rotation loop with speedMultiplier
  useEffect(() => {
    if (!isPlaying || viewMode !== 'orbit' || hoveredCardId !== null || isDragging) return;
    const interval = setInterval(() => {
      setOrbitAngle((prev) => (prev + 0.006 * speedMultiplier) % (Math.PI * 2));
    }, 25);
    return () => clearInterval(interval);
  }, [isPlaying, viewMode, hoveredCardId, isDragging, speedMultiplier]);

  // Pointer drag to spin the 3D orbit manually
  const handlePointerDown = (e) => {
    if (viewMode !== 'orbit') return;
    setIsDragging(true);
    dragStartX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragStartAngle.current = orbitAngle;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) {
      // Update gentle parallax tilt when moving cursor
      if (arenaRef.current && viewMode === 'orbit') {
        const rect = arenaRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || rect.left + rect.width / 2;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || rect.top + rect.height / 2;
        const normX = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const normY = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        setTilt({ x: normY * -8, y: normX * 10 });
      }
      return;
    }
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = currentX - dragStartX.current;
    // 300px drag equals ~ full rotation
    const newAngle = dragStartAngle.current + (deltaX / 180);
    setOrbitAngle(newAngle);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Animated Cosmic Illustration Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // 110 Cosmic Stardust Vortex Particles
    const particles = [];
    const particleCount = 110;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 35 + Math.random() * (Math.min(width, height) * 0.48),
        speed: (0.002 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1),
        radius: 1 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.7,
      });
    }

    let time = 0;

    const renderCanvas = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      const centerX = width / 2;
      const centerY = height / 2;

      // Central Luminous Nebula Glow
      const centerGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.min(width, height) * 0.45
      );

      if (activeMoodTheme === 'sad') {
        centerGrad.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
        centerGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.14)');
        centerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (activeMoodTheme === 'gussa') {
        centerGrad.addColorStop(0, 'rgba(239, 68, 68, 0.30)');
        centerGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.16)');
        centerGrad.addColorStop(1, 'rgba(24, 24, 27, 0)');
      } else if (activeMoodTheme === 'normal') {
        centerGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
        centerGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.14)');
        centerGrad.addColorStop(1, 'rgba(6, 78, 59, 0)');
      } else {
        // Happy
        centerGrad.addColorStop(0, 'rgba(251, 113, 133, 0.30)');
        centerGrad.addColorStop(0.45, 'rgba(251, 191, 36, 0.18)');
        centerGrad.addColorStop(1, 'rgba(255, 241, 242, 0)');
      }

      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(width, height) * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Interlocking Sacred Geometric Concentric Rings
      const ringCount = 5;
      for (let r = 0; r < ringCount; r++) {
        const ringRadius = 70 + r * 50 + Math.sin(time + r * 0.5) * 12;
        ctx.save();
        ctx.strokeStyle =
          activeMoodTheme === 'sad'
            ? 'rgba(147, 197, 253, 0.18)'
            : activeMoodTheme === 'gussa'
            ? 'rgba(252, 165, 165, 0.20)'
            : activeMoodTheme === 'normal'
            ? 'rgba(110, 231, 183, 0.18)'
            : 'rgba(254, 205, 211, 0.24)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 12]);
        ctx.lineDashOffset = -time * 25 * (r % 2 === 0 ? 1 : -1);

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, ringRadius, ringRadius * 0.62, time * 0.2 * (r % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Stardust Vortex Orbiting Particles
      for (let p of particles) {
        p.angle += p.speed;
        const px = centerX + Math.cos(p.angle) * p.dist;
        const py = centerY + Math.sin(p.angle) * (p.dist * 0.62);

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * (0.4 + Math.sin(time * 2 + p.dist) * 0.3)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [activeMoodTheme]);

  // Couple Heartwave Pulse Click
  const handleCoupleHeartwave = (e) => {
    e.stopPropagation();
    playCelestialChime(880);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: {
        x: e.clientX ? e.clientX / window.innerWidth : 0.5,
        y: e.clientY ? e.clientY / window.innerHeight : 0.5,
      },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#34d399', '#38bdf8', '#c084fc'],
    });
  };

  // Add Image Handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const handleAddImageSubmit = async (e) => {
    e.preventDefault();
    setAddFeedback('');

    if (addMode === 'file') {
      if (!newImageFile) {
        setAddFeedback('Please select an image file to upload.');
        return;
      }
      try {
        const formData = new FormData();
        formData.append('media', newImageFile);
        formData.append('caption', newCaption || 'Our magical memory in the 3D Universe');
        formData.append('isVisibleOnDashboard', 'true');
        await uploadMemory(formData);
        
        playCelestialChime(784);
        confetti({ particleCount: 45, spread: 65 });
        handleCloseAddModal();
      } catch (err) {
        setAddFeedback(err.response?.data?.message || err.message || 'Failed to upload photo.');
      }
    } else {
      // URL Mode
      if (!newImageUrl.trim()) {
        setAddFeedback('Please enter a valid image URL.');
        return;
      }
      const newMemory = {
        _id: `custom-url-${Date.now()}`,
        url: newImageUrl.trim(),
        caption: newCaption.trim() || 'A starry moment together in love',
        uploaderName: newUploader || user?.displayName || 'Ashis',
        date: new Date().toISOString().split('T')[0],
      };
      setLocalAddedMemories((prev) => [newMemory, ...prev]);
      playCelestialChime(784);
      confetti({ particleCount: 45, spread: 65 });
      handleCloseAddModal();
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewImageFile(null);
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImagePreview('');
    setNewImageUrl('');
    setNewCaption('');
    setAddFeedback('');
  };

  // Remove Image Handlers
  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;
    const id = imageToDelete._id;

    try {
      // If it's a backend mongo id (24 hex characters)
      if (id && /^[0-9a-fA-F]{24}$/.test(id) && deleteMemory) {
        await deleteMemory(id);
      }
      // Also filter out from local added memories
      setLocalAddedMemories((prev) => prev.filter((m) => m._id !== id));
      // Mark as hidden so sample/fallback won't return
      setRemovedImageIds((prev) => [...prev, id]);

      playCelestialChime(440);
      setImageToDelete(null);
      if (selectedImage?._id === id) {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('Delete error', err);
      // Still remove locally to give immediate feedback
      setLocalAddedMemories((prev) => prev.filter((m) => m._id !== id));
      setRemovedImageIds((prev) => [...prev, id]);
      setImageToDelete(null);
    }
  };

  // Up to 8 celestial satellite positions for 3D Orbit View
  const orbitItems = galleryItems.slice(0, 8);

  // Responsive 3D Radii calculation
  const isMobile = arenaWidth < 640;
  const isTablet = arenaWidth >= 640 && arenaWidth < 1024;
  const rx = isMobile ? Math.min(arenaWidth * 0.40, 140) : isTablet ? 220 : 310;
  const ry = isMobile ? Math.min(arenaWidth * 0.22, 75) : isTablet ? 110 : 140;

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.8rem] p-4 sm:p-7 md:p-9 shadow-2xl border transition-all duration-700 bg-slate-950/95 border-white/20 my-6 sm:my-8 text-white select-none"
    >
      {/* Animated Hypnotic Stardust Vortex Canvas in Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Atmospheric Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/85 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* HEADER BAR: Title, Dynamic Whsiper, Tabs & Add Image Action */}
      {/* ========================================================= */}
      <div className="relative z-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-rose-200 border border-white/25 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              Living Memory Universe
            </span>
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-400/30">
              <span className="text-emerald-300">Ashis</span>
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              <span className="text-pink-300">Kirti</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tight text-white drop-shadow-md">
            Our Drifting Constellation of Love
          </h2>

          {/* Dynamic Cycling Romantic Love Whisper */}
          <div className="h-6 overflow-hidden mt-0.5">
            <AnimatePresence mode="wait">
              <motion.p
                key={whisperIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-xs sm:text-sm text-amber-200/90 font-serif italic truncate"
              >
                "{ROMANTIC_WHISPERS[whisperIdx]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* View Switcher, Orbit Speed Controls & Add Image Button */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Add Image Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 border border-white/30 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Image</span>
          </motion.button>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-lg">
            <button
              onClick={() => {
                setViewMode('orbit');
                playCelestialChime(523.25);
              }}
              title="3D Revolving Orbit View"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'orbit'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">3D Orbit</span>
            </button>

            <button
              onClick={() => {
                setViewMode('floating');
                playCelestialChime(659.25);
              }}
              title="Zero-G Galaxy View"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'floating'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Zero-G</span>
            </button>

            <button
              onClick={() => {
                setViewMode('stream');
                playCelestialChime(783.99);
              }}
              title="Gliding Stream View"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'stream'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <InfinityIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Stream</span>
            </button>

            {/* Play / Pause Rotation */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause movement' : 'Resume movement'}
              className="p-1.5 rounded-xl bg-white/15 text-white hover:bg-white/25 cursor-pointer transition-colors ml-0.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. 3D CELESTIAL ORBIT VIEW (Interactive Solar System of Love) */}
      {/* ======================================================== */}
      {viewMode === 'orbit' && (
        <div
          ref={arenaRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            perspective: 1200,
            touchAction: 'none',
          }}
          className="relative z-10 w-full h-[430px] sm:h-[490px] md:h-[540px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          {/* Subtle 3D Orbit Drag Guide Hint */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1.5 text-[10px] sm:text-xs text-rose-200/80 bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/15">
            <Move className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>Drag or swipe anywhere to spin our 3D universe smoothly</span>
          </div>

          {/* 3D Perspective Container with tilt parallax */}
          <div
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: 'preserve-3d',
              transition: isDragging ? 'none' : 'transform 0.4s ease-out',
            }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* ==================================================== */}
            {/* CENTRAL SMOOTH COUPLE PIECE: Ashis ❤️ Kirti Harmony Core */}
            {/* ==================================================== */}
            <motion.div
              onClick={handleCoupleHeartwave}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              title="Click to pulse Ashis & Kirti's Cosmic Love Wave!"
              className="absolute z-20 flex flex-col items-center justify-center text-center p-3 sm:p-5 rounded-full bg-gradient-to-tr from-rose-600/90 via-pink-600/80 to-amber-500/90 backdrop-blur-xl border-2 sm:border-4 border-white/50 shadow-[0_0_60px_rgba(244,63,94,0.7)] w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 cursor-pointer transition-shadow"
            >
              {/* Outer Counter-Rotating Celestial Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2.5 sm:-inset-4 rounded-full border-2 border-dashed border-amber-300/50 pointer-events-none"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-5 sm:-inset-7 rounded-full border border-dotted border-rose-300/40 pointer-events-none"
              />

              {/* Couple Dual Initials Pill (Ashis & Kirti) */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500/80 border border-emerald-300 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md">
                  A
                </span>
                <Heart className="w-5 h-5 sm:w-7 sm:h-7 fill-white text-white drop-shadow-lg animate-heartbeat" />
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-rose-500/80 border border-rose-300 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md">
                  K
                </span>
              </div>

              <h4 className="text-xs sm:text-base font-serif font-black tracking-tight text-white drop-shadow-md">
                Ashis &amp; Kirti
              </h4>

              <span className="text-[9px] sm:text-[10px] font-bold text-amber-200 mt-0.5 uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full border border-amber-200/30">
                10/09/2020 • Forever
              </span>
            </motion.div>

            {/* Orbit Navigation Controls Bar */}
            <div className="absolute bottom-2 left-3 sm:left-6 z-30 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-white/15 shadow-lg">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOrbitAngle((prev) => prev - 0.4);
                }}
                title="Rotate Left"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOrbitAngle((prev) => prev + 0.4);
                }}
                title="Rotate Right"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              {/* Speed Preset Toggles */}
              <div className="hidden sm:flex items-center gap-1 ml-1 pl-1.5 border-l border-white/20 text-[10px] font-bold">
                {[
                  { label: 'Gentle', val: 0.5 },
                  { label: 'Normal', val: 1 },
                  { label: 'Rush', val: 1.8 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpeedMultiplier(s.val);
                    }}
                    className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                      speedMultiplier === s.val
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ==================================================== */}
            {/* 6-8 REVOLVING CELESTIAL MEMORY SATELLITES */}
            {/* ==================================================== */}
            {orbitItems.map((item, idx) => {
              const shape = SHAPES[idx % SHAPES.length];
              const theta = orbitAngle + (idx * (Math.PI * 2)) / orbitItems.length;

              // Elliptical 3D Projection
              const x = Math.cos(theta) * rx;
              const y = Math.sin(theta) * ry;

              // Depth calculation: items in front are larger, brighter with higher z-index
              const depthNorm = (Math.sin(theta) + 1) / 2; // 0 (back) to 1 (front)
              const scale = 0.62 + depthNorm * 0.48;
              const opacity = 0.4 + depthNorm * 0.6;
              const zIndex = Math.round(depthNorm * 35);
              const isHovered = hoveredCardId === item._id;

              return (
                <div
                  key={item._id}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0px) scale(${isHovered ? scale * 1.25 : scale})`,
                    zIndex: isHovered ? 40 : zIndex,
                    opacity: isHovered ? 1 : opacity,
                    filter: depthNorm < 0.25 && !isHovered ? 'blur(1px)' : 'none',
                    transition: isDragging ? 'none' : 'transform 0.25s ease-out, opacity 0.25s ease-out',
                  }}
                  onMouseEnter={() => {
                    setHoveredCardId(item._id);
                    playCelestialChime(500 + idx * 70);
                  }}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(item);
                  }}
                  className={`absolute group cursor-pointer w-28 sm:w-36 md:w-44 overflow-hidden shadow-2xl ${shape.clipClass} ${shape.borderStyle}`}
                >
                  <img
                    src={item.url}
                    alt={item.caption || 'Memory'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115 aspect-square"
                    loading="lazy"
                  />

                  {/* Shimmer Light pass */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

                  {/* Floating Action Buttons & Details on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 sm:p-3 text-white">
                    {/* Top action row: Heart and Trash/Remove */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-300 truncate max-w-[80px]">
                        {item.uploaderName}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {/* Remove Image Button */}
                        <motion.button
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageToDelete(item);
                          }}
                          title="Remove image from universe"
                          className="p-1 rounded-full bg-black/60 hover:bg-rose-600 text-rose-200 hover:text-white cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Love Heart reaction button */}
                        <motion.button
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            playCelestialChime(880);
                            confetti({ particleCount: 25, spread: 50 });
                          }}
                          className="p-1 rounded-full bg-rose-600/90 text-white cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Bottom caption */}
                    <p className="text-[10px] sm:text-[11px] font-serif italic line-clamp-2 text-rose-100 leading-tight">
                      "{item.caption || 'Cherished love memory'}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ZERO-G FLOATING GALAXY (Free Floating Morphing Constellation) */}
      {/* ======================================================== */}
      {viewMode === 'floating' && (
        <div className="relative z-10 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {galleryItems.slice(0, 6).map((item, idx) => {
            const shape = SHAPES[idx % SHAPES.length];
            return (
              <motion.div
                key={item._id}
                animate={
                  isPlaying
                    ? {
                        y: [0, idx % 2 === 0 ? -14 : 14, 0],
                        rotate: [0, idx % 2 === 0 ? 2.5 : -2.5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 4.5 + (idx % 3),
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.12, y: -8 }}
                onClick={() => setSelectedImage(item)}
                className={`group relative overflow-hidden cursor-pointer shadow-2xl transition-all aspect-square ${shape.clipClass} ${shape.borderStyle}`}
              >
                <img
                  src={item.url}
                  alt={item.caption || 'Memory'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 sm:p-3 text-white">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageToDelete(item);
                      }}
                      title="Remove image"
                      className="p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-300">
                      {item.uploaderName}
                    </span>
                    <p className="text-[11px] font-serif italic truncate text-rose-100">
                      "{item.caption || 'In love forever'}"
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CONTINUOUS GLIDING STREAM (Dual Counter-Moving Tracks) */}
      {/* ======================================================== */}
      {viewMode === 'stream' && (
        <div className="relative z-10 space-y-4 py-3 overflow-hidden">
          {/* Track 1 */}
          <motion.div
            animate={isPlaying ? { x: [0, -1400] } : false}
            transition={{ x: { repeat: Infinity, duration: 32, ease: 'linear' } }}
            className="flex items-center gap-4 sm:gap-6 w-max"
          >
            {[...galleryItems, ...galleryItems].map((item, idx) => {
              const shape = SHAPES[idx % SHAPES.length];
              return (
                <motion.div
                  key={`${item._id}-st1-${idx}`}
                  whileHover={{ scale: 1.12, y: -6 }}
                  onClick={() => setSelectedImage(item)}
                  className={`group relative w-36 sm:w-48 shrink-0 aspect-square overflow-hidden cursor-pointer shadow-xl ${shape.clipClass} ${shape.borderStyle}`}
                >
                  <img src={item.url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-between p-2.5 sm:p-3 text-white">
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageToDelete(item);
                        }}
                        className="p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-rose-300">{item.uploaderName}</span>
                      <p className="text-xs font-serif italic truncate">{item.caption}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Track 2 */}
          <motion.div
            animate={isPlaying ? { x: [-1400, 0] } : false}
            transition={{ x: { repeat: Infinity, duration: 36, ease: 'linear' } }}
            className="flex items-center gap-4 sm:gap-6 w-max"
          >
            {[...galleryItems, ...galleryItems].reverse().map((item, idx) => {
              const shape = SHAPES[(idx + 2) % SHAPES.length];
              return (
                <motion.div
                  key={`${item._id}-st2-${idx}`}
                  whileHover={{ scale: 1.12, y: -6 }}
                  onClick={() => setSelectedImage(item)}
                  className={`group relative w-36 sm:w-48 shrink-0 aspect-square overflow-hidden cursor-pointer shadow-xl ${shape.clipClass} ${shape.borderStyle}`}
                >
                  <img src={item.url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-between p-2.5 sm:p-3 text-white">
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageToDelete(item);
                        }}
                        className="p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-300">{item.uploaderName}</span>
                      <p className="text-xs font-serif italic truncate">{item.caption}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD IMAGE TO 3D UNIVERSE MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAddModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseAddModal}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                    Add Memory to 3D Universe
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Add photos that smoothly join Ashis &amp; Kirti's revolving constellation.
                </p>
              </div>

              {/* Mode Switcher: Upload File vs Image URL */}
              <div className="flex items-center gap-2 p-1 bg-white/10 rounded-xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAddMode('file')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    addMode === 'file'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('url')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    addMode === 'url'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>

              {addFeedback && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addFeedback}</span>
                </div>
              )}

              <form onSubmit={handleAddImageSubmit} className="space-y-4">
                {/* File Upload Mode */}
                {addMode === 'file' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer border-2 border-dashed border-rose-400/40 hover:border-rose-400 rounded-2xl p-4 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-all min-h-[140px]"
                    >
                      {newImagePreview ? (
                        <div className="relative w-full max-h-48 overflow-hidden rounded-xl">
                          <img
                            src={newImagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-xl"
                          />
                          <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 px-2 py-0.5 rounded-full text-white">
                            Tap to change
                          </span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-xs font-semibold text-slate-200">
                            Click to browse photo from device
                          </p>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            PNG, JPG, WEBP, GIF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* URL Input Mode */
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Direct Image Web Link (URL)
                    </label>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or any photo link"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-rose-400"
                    />
                    {newImageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden max-h-32 border border-white/20">
                        <img
                          src={newImageUrl}
                          alt="URL Preview"
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Romantic Caption */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Romantic Caption / Memory Note
                  </label>
                  <input
                    type="text"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="e.g. Under the stars with my favorite person ❤️"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-rose-400"
                  />
                </div>

                {/* Uploader Name */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-300 font-semibold">Added by:</span>
                  <div className="flex items-center gap-2">
                    {['Ashis', 'Kirti'].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setNewUploader(name)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                          newUploader === name
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-teal-500/30 cursor-pointer flex items-center gap-1.5"
                  >
                    {isUploading ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Add to Universe</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* CONFIRM DELETE / REMOVE IMAGE MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {imageToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImageToDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl text-white text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-1">
                Remove Memory from Universe?
              </h3>
              <p className="text-xs text-slate-300 mb-4 font-serif italic">
                "{imageToDelete.caption || 'This cherished memory'}"
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setImageToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  Keep in Universe
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Remove</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* ROMANTIC FULL-SCREEN LIGHTBOX MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            >
              {/* Top Controls: Remove and Close */}
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <button
                  onClick={() => {
                    setImageToDelete(selectedImage);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer transition-colors shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-white hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-7 h-7" />
                </motion.button>
              </div>

              {/* Lightbox Image Container */}
              <div className="rounded-3xl overflow-hidden max-h-[72vh] bg-black shadow-2xl border-2 border-white/20">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption || 'Memory'}
                  className="max-h-[72vh] w-auto object-contain"
                />
              </div>

              {/* Caption & Metadata */}
              {selectedImage.caption && (
                <div className="mt-4 text-center px-4 max-w-xl">
                  <p className="text-rose-100 text-sm sm:text-base font-serif italic">
                    "{selectedImage.caption}"
                  </p>
                  <p className="text-xs text-rose-300/80 mt-1">
                    Captured by {selectedImage.uploaderName} • Ashis &amp; Kirti Love Universe
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};