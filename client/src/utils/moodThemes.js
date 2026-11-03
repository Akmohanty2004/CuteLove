export const MOOD_THEMES = {
  happy: {
    id: 'happy',
    name: 'Happy & Radiant',
    emoji: '😊',
    iconText: '☀️ Sunlit Blossoms',
    isDark: false,
    
    // Background: Radiant daylight sunshine & warm rose
    bgGradient: 'from-amber-100 via-rose-50 to-pink-100',
    navBg: 'bg-white/95 border-amber-300 text-slate-950 shadow-sm',
    navPill: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
    tabActive: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30 font-bold',
    tabInactive: 'text-slate-700 hover:text-slate-950 hover:bg-amber-100/60 font-semibold',
    
    // Cards
    cardBg: 'bg-white/95 backdrop-blur-xl border-2 border-amber-200 shadow-romantic text-slate-950',
    headingText: 'text-slate-950 font-bold',
    subText: 'text-slate-700 font-medium',
    borderAccent: 'border-amber-200',
    
    // Buttons & Badges
    primaryBtn: 'from-amber-500 via-rose-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white shadow-amber-500/25',
    badgeBg: 'bg-amber-100 text-amber-950 border-2 border-amber-300 font-bold',
    anniversaryGrad: 'from-amber-500 via-rose-500 to-pink-600',
    
    bannerText: '☀️ Radiant Sunshine & Happy Blossoms — Our Love Is Blooming!',
    soundLabel: 'Golden Chimes',

    // Dynamic Image & Card Morphing Shape & Colors
    cardShape: 'rounded-[2.4rem] rounded-tr-[1.25rem] rounded-bl-[1.25rem]',
    imageShape: 'rounded-[2rem] rounded-tr-[1rem] rounded-bl-[1rem]',
    cardGlow: 'border-2 border-amber-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 hover:border-amber-400',
    imgFilter: 'brightness-105 saturate-110 contrast-[1.02]',
    moodTag: '✨ Blossom Radiance',
    moodTagBg: 'bg-amber-100 text-amber-950 border-2 border-amber-300 font-bold',
    likeGradient: 'from-amber-400 to-rose-500',
    likeActive: 'fill-rose-500 text-rose-500',
  },

  normal: {
    id: 'normal',
    name: 'Peaceful & Normal',
    emoji: '😌',
    iconText: '🍃 Serene Harmony',
    isDark: false,
    
    // Background: Tranquil jade & calm lavender blush
    bgGradient: 'from-emerald-50 via-teal-50/60 to-rose-50/70',
    navBg: 'bg-white/95 border-emerald-300 text-slate-950 shadow-sm',
    navPill: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold',
    tabActive: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 font-bold',
    tabInactive: 'text-slate-700 hover:text-slate-950 hover:bg-emerald-100/60 font-semibold',
    
    // Cards
    cardBg: 'bg-white/95 backdrop-blur-xl border-2 border-emerald-200 shadow-romantic text-slate-950',
    headingText: 'text-slate-950 font-bold',
    subText: 'text-slate-700 font-medium',
    borderAccent: 'border-emerald-200',
    
    // Buttons & Badges
    primaryBtn: 'from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/25',
    badgeBg: 'bg-emerald-100 text-emerald-950 border-2 border-emerald-300 font-bold',
    anniversaryGrad: 'from-emerald-600 via-teal-600 to-teal-700',
    
    bannerText: '🍃 Serene Harmony & Soft Breeze — Resting Peacefully In Love',
    soundLabel: 'Forest Breeze',

    // Dynamic Image & Card Morphing Shape & Colors
    cardShape: 'rounded-[2.25rem] rounded-tl-[1rem] rounded-br-[1rem]',
    imageShape: 'rounded-[2rem] rounded-tl-[0.8rem] rounded-br-[0.8rem]',
    cardGlow: 'border-2 border-emerald-300 shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/30 hover:border-emerald-400',
    imgFilter: 'contrast-[1.02] saturate-105',
    moodTag: '🍃 Serene Pebble',
    moodTagBg: 'bg-emerald-100 text-emerald-950 border-2 border-emerald-300 font-bold',
    likeGradient: 'from-emerald-400 to-teal-500',
    likeActive: 'fill-emerald-500 text-emerald-500',
  },

  sad: {
    id: 'sad',
    name: 'Sad & Melancholy',
    emoji: '🥺',
    iconText: '🌧️ Misty Rainy Night',
    isDark: true,
    
    // Background: Realistic misty twilight & rainy night sky
    bgGradient: 'from-slate-950 via-indigo-950 to-blue-950',
    navBg: 'bg-slate-950/95 border-blue-500/40 text-blue-50 shadow-md',
    navPill: 'bg-blue-900/80 text-blue-100 border border-blue-400/50 font-bold',
    tabActive: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/40 font-bold',
    tabInactive: 'text-blue-200 hover:text-white hover:bg-blue-900/50 font-semibold',
    
    // Cards
    cardBg: 'bg-slate-900/90 backdrop-blur-2xl border-2 border-blue-500/40 shadow-2xl shadow-blue-950 text-blue-50',
    headingText: 'text-white font-black',
    subText: 'text-blue-200 font-medium',
    borderAccent: 'border-blue-500/40',
    
    // Buttons & Badges
    primaryBtn: 'from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/35',
    badgeBg: 'bg-blue-950 text-blue-100 border-2 border-blue-400/60 font-bold',
    anniversaryGrad: 'from-blue-700 via-indigo-800 to-slate-900 border border-blue-500/40',
    
    bannerText: '🌧️ Rainy Overcast — Feeling low today. Wrapped in warm cuddles & infinite love 🥺💙',
    soundLabel: 'Rain Drops',

    // Dynamic Image & Card Morphing Shape & Colors
    cardShape: 'rounded-t-[3rem] rounded-b-2xl',
    imageShape: 'rounded-t-[2.8rem] rounded-b-xl',
    cardGlow: 'border-2 border-blue-400/70 shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:border-cyan-400',
    imgFilter: 'contrast-[1.08] saturate-95 hue-rotate-[-5deg]',
    moodTag: '🌧️ Raindrop Ripple',
    moodTagBg: 'bg-blue-900 text-blue-100 border-2 border-blue-400/60 font-bold',
    likeGradient: 'from-blue-500 to-cyan-500',
    likeActive: 'fill-cyan-400 text-cyan-400',
  },

  gussa: {
    id: 'gussa',
    name: 'Gussa & Fiery Pout',
    emoji: '😤',
    iconText: '🔥 Fiery Embers & Magma',
    isDark: true,
    
    // Background: Realistic glowing embers & smoldering volcanic sunset
    bgGradient: 'from-neutral-950 via-stone-900 to-red-950',
    navBg: 'bg-neutral-950/95 border-red-500/50 text-rose-50 shadow-md',
    navPill: 'bg-red-950/80 text-rose-100 border border-red-400/50 font-bold',
    tabActive: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-600/40 font-bold',
    tabInactive: 'text-rose-200 hover:text-white hover:bg-red-900/50 font-semibold',
    
    // Cards
    cardBg: 'bg-neutral-900/90 backdrop-blur-2xl border-2 border-red-500/40 shadow-2xl shadow-red-950 text-rose-50',
    headingText: 'text-white font-black',
    subText: 'text-rose-200 font-medium',
    borderAccent: 'border-red-500/40',
    
    // Buttons & Badges
    primaryBtn: 'from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-rose-600/35',
    badgeBg: 'bg-red-950 text-rose-100 border-2 border-red-400/60 font-bold',
    anniversaryGrad: 'from-red-700 via-rose-800 to-neutral-900 border border-red-500/40',
    
    bannerText: '🔥 High Temperature Alert! Gussa Mode Activated — Deliver 100x Kisses Immediately! 😤❤️',
    soundLabel: 'Crackling Fire',

    // Dynamic Image & Card Morphing Shape & Colors
    cardShape: 'rounded-3xl rounded-tl-sm rounded-br-sm',
    imageShape: 'rounded-[1.4rem] rounded-tl-none rounded-br-none',
    cardGlow: 'border-2 border-rose-500 shadow-2xl shadow-rose-600/40 hover:shadow-rose-600/60 hover:border-orange-500 ring-1 ring-rose-500/40',
    imgFilter: 'saturate-125 contrast-110',
    moodTag: '🔥 Magma Spark',
    moodTagBg: 'bg-red-950 text-rose-100 border-2 border-red-400/60 font-bold',
    likeGradient: 'from-red-500 to-orange-500',
    likeActive: 'fill-rose-500 text-rose-500',
  },
};