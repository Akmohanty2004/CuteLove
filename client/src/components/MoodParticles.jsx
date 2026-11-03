import React from 'react';
import { motion } from 'framer-motion';

export const MoodParticles = ({ type = 'sun' }) => {
  // Generate random particles
  const count = 15;
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 4,
    size: 6 + Math.random() * 12,
  }));

  if (type === 'rain') {
    // Gentle comforting raindrops for Sad mood
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -50, opacity: 0 }}
            animate={{
              y: ['0vh', '105vh'],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            }}
            style={{
              left: `${p.x}%`,
              width: '2px',
              height: `${p.size * 2}px`,
            }}
            className="absolute rounded-full bg-blue-400/50"
          />
        ))}
      </div>
    );
  }

  if (type === 'fire') {
    // Fiery floating embers for Gussa mood
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.8, 0.8, 0],
              scale: [0.5, 1.2, 0.6],
              x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeOut',
            }}
            style={{
              left: `${p.x}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
            className="absolute rounded-full bg-gradient-to-t from-red-500 to-amber-400 blur-[1px] shadow-sm shadow-red-500"
          />
        ))}
      </div>
    );
  }

  if (type === 'leaf') {
    // Serene leaves / breeze for Normal mood
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -30, opacity: 0, rotate: 0 }}
            animate={{
              y: '105vh',
              opacity: [0, 0.7, 0.7, 0],
              rotate: [0, 180, 360],
              x: [`${p.x}%`, `${p.x + Math.sin(p.id) * 8}%`],
            }}
            transition={{
              duration: p.duration * 1.5,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
            style={{
              left: `${p.x}%`,
              fontSize: `${p.size + 4}px`,
            }}
            className="absolute select-none opacity-60"
          >
            🍃
          </motion.div>
        ))}
      </div>
    );
  }

  // Default 'sun': Golden sparkles & floating love petals for Happy mood
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.8, 0.8, 0],
            scale: [0.5, 1.3, 0.7],
            x: [`${p.x}%`, `${p.x + Math.cos(p.id) * 6}%`],
          }}
          transition={{
            duration: p.duration * 1.3,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size + 4}px`,
          }}
          className="absolute select-none opacity-70"
        >
          {p.id % 2 === 0 ? '✨' : '🌸'}
        </motion.div>
      ))}
    </div>
  );
};
