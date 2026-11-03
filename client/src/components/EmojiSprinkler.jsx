import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const SPRINKLER_CONFIGS = {
  hug: {
    emojis: ['🤗', '🧸', '🫂', '💛', '✨', '🤗', '🧸'],
    colors: ['#fbbf24', '#f59e0b', '#fb7185', '#fde047'],
    label: 'Warm Hug Shower',
    soundPitch: 659.25, // E5
  },
  kiss: {
    emojis: ['💋', '😘', '🌹', '💄', '💖', '💋', '😘'],
    colors: ['#f43f5e', '#ec4899', '#fda4af', '#fb7185'],
    label: 'Sweet Kisses Shower',
    soundPitch: 783.99, // G5
  },
  sparkles: {
    emojis: ['✨', '⭐', '🌟', '💫', '💎', '✨', '⭐'],
    colors: ['#facc15', '#38bdf8', '#c084fc', '#fef08a'],
    label: 'Starlight Sparkle Shower',
    soundPitch: 880.0, // A5
  },
  heart: {
    emojis: ['💖', '❤️', '💕', '💘', '💓', '💗', '❤️'],
    colors: ['#e11d48', '#f43f5e', '#ff2d55', '#fda4af'],
    label: 'Infinite Hearts Shower',
    soundPitch: 698.46, // F5
  },
  fire: {
    emojis: ['🔥', '💥', '⚡', '❤️‍🔥', '✨', '🔥', '💥'],
    colors: ['#ef4444', '#f97316', '#fbbf24', '#f87171'],
    label: 'Fiery Passion Shower',
    soundPitch: 587.33, // D5
  },
};

export const playSprinklerChime = (freq = 784) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {
    // Audio restricted
  }
};

export const triggerSprinklerEffect = (rawType = 'hug') => {
  const norm = String(rawType || 'hug').toLowerCase();
  const type = norm.includes('kiss')
    ? 'kiss'
    : norm.includes('hug')
    ? 'hug'
    : norm.includes('spark') || norm.includes('star')
    ? 'sparkles'
    : norm.includes('fire') || norm.includes('flame')
    ? 'fire'
    : 'heart';

  const config = SPRINKLER_CONFIGS[type] || SPRINKLER_CONFIGS.hug;

  playSprinklerChime(config.soundPitch);

  // 1. Dual Canvas-Confetti burst
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 70,
    origin: { x: 0.1, y: 0.3 },
    colors: config.colors,
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 70,
    origin: { x: 0.9, y: 0.3 },
    colors: config.colors,
  });

  // 2. Dispatch custom event so the DOM sprinkler drops emojis across the page
  const event = new CustomEvent('trigger_emoji_sprinkler', {
    detail: {
      type,
      config,
      timestamp: Date.now(),
    },
  });
  window.dispatchEvent(event);
};

export const EmojiSprinkler = () => {
  const [activeParticles, setActiveParticles] = useState([]);

  useEffect(() => {
    const handleSprinklerEvent = (e) => {
      const { config, type } = e.detail;
      const emojis = config.emojis;

      // Generate 32 falling emoji particles
      const newParticles = Array.from({ length: 32 }).map((_, i) => ({
        id: `${Date.now()}-${i}-${Math.random()}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 92 + 4, // 4% to 96%
        size: Math.random() * 22 + 22, // 22px to 44px
        duration: Math.random() * 1.5 + 2.0, // 2.0s to 3.5s
        delay: Math.random() * 0.6,
        rotateStart: Math.random() * 40 - 20,
        rotateEnd: Math.random() * 180 - 90,
        driftX: Math.random() * 60 - 30,
      }));

      setActiveParticles((prev) => [...prev, ...newParticles]);

      // Auto-cleanup after 4 seconds
      setTimeout(() => {
        setActiveParticles((prev) =>
          prev.filter((p) => !newParticles.some((np) => np.id === p.id))
        );
      }, 4200);
    };

    window.addEventListener('trigger_emoji_sprinkler', handleSprinklerEvent);
    return () =>
      window.removeEventListener('trigger_emoji_sprinkler', handleSprinklerEvent);
  }, []);

  if (activeParticles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {activeParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 0,
              y: '-10vh',
              x: `${p.left}vw`,
              rotate: p.rotateStart,
              scale: 0.5,
            }}
            animate={{
              opacity: [0, 1, 1, 0.9, 0],
              y: '108vh',
              x: `calc(${p.left}vw + ${p.driftX}px)`,
              rotate: p.rotateEnd,
              scale: [0.5, 1.2, 1, 0.9],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              fontSize: `${p.size}px`,
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))',
            }}
            className="absolute will-change-transform select-none"
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
