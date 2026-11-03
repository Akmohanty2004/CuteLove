import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

const ROMANTIC_QUOTES = [
  "Welcome to our world, Ashis & Kirti ✨",
  "Every love story is beautiful, but ours is my favorite ❤️",
  "You are my today and all of my tomorrows 🌹",
  "Two souls, one private universe 💫",
  "In a sea of people, my eyes will always search for you 🌊💕",
  "Thirty days, thirty years, a lifetime together 💖"
];

export const WelcomeScreen = ({ onComplete }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Cycle through quotes every 2.8 seconds
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ROMANTIC_QUOTES.length);
    }, 2800);

    // Auto-advance after 4.5s if user hasn't clicked
    const autoTimer = setTimeout(() => {
      onCompleteRef.current?.();
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(autoTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-rose-950 via-slate-900 to-pink-950 text-white select-none px-6"
    >
      {/* Soft glowing ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" style={{ animationDelay: '1.5s' }} />

      {/* Heart beat centerpiece icon */}
      <motion.div
        animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="relative mb-8 flex items-center justify-center"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-500/40">
          <Heart className="w-12 h-12 text-white fill-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute -inset-3 rounded-full border border-rose-300/30 border-dashed"
        />
      </motion.div>

      {/* Couple Branding */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-center mb-6"
      >
        <span className="text-xs uppercase tracking-widest text-rose-300 font-semibold px-4 py-1.5 rounded-full bg-rose-950/60 border border-rose-800/60 mb-3 inline-block">
          Exclusive Private Couple Space
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-100 to-amber-200 tracking-tight">
          Ashis <span className="text-rose-400 font-normal cursive-font text-5xl md:text-7xl">&amp;</span> Kirti
        </h1>
      </motion.div>

      {/* Rotating quotes with AnimatePresence */}
      <div className="h-16 flex items-center justify-center max-w-xl text-center px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={quoteIndex}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.5 }}
            className="text-lg md:text-xl text-rose-100/90 font-light italic leading-relaxed"
          >
            "{ROMANTIC_QUOTES[quoteIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Interactive Enter Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={onComplete}
        className="mt-10 group flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm shadow-lg shadow-rose-600/30 border border-rose-400/30 transition-all cursor-pointer"
      >
        <span>Enter Our World</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
};
