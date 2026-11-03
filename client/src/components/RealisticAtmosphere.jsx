import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const RealisticAtmosphere = ({ mood = 'happy' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pools based on mood
    let particles = [];

    if (mood === 'sad') {
      // Realistic Rain Drops & Window Droplets
      const rainCount = 140;
      for (let i = 0; i < rainCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 12 + Math.random() * 16,
          length: 15 + Math.random() * 25,
          thickness: 1 + Math.random() * 1.5,
          opacity: 0.2 + Math.random() * 0.45,
          type: 'drop',
        });
      }
      // Glass Condensation Droplets (stationary with slow sliding)
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.5 + Math.random() * 3,
          opacity: 0.3 + Math.random() * 0.5,
          slideSpeed: Math.random() > 0.6 ? 0.2 + Math.random() * 0.5 : 0,
          type: 'condense',
        });
      }
    } else if (mood === 'gussa') {
      // Realistic Rising Fiery Embers & Sparks
      const emberCount = 85;
      for (let i = 0; i < emberCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: height + Math.random() * 100,
          size: 1.5 + Math.random() * 4,
          speedY: -(1.5 + Math.random() * 3.5),
          speedX: (Math.random() - 0.5) * 1.8,
          opacity: 0.3 + Math.random() * 0.7,
          color: Math.random() > 0.4 ? '#ff3b30' : Math.random() > 0.5 ? '#ff9500' : '#ffcc00',
          life: 0.6 + Math.random() * 0.4,
          decay: 0.003 + Math.random() * 0.005,
        });
      }
    } else if (mood === 'happy') {
      // Realistic Golden Sunbeams, Bokeh & Drifting Rose Petals
      const petalCount = 45;
      for (let i = 0; i < petalCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 6 + Math.random() * 10,
          speedY: 0.8 + Math.random() * 1.6,
          speedX: Math.sin(i) * 0.9,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: (Math.random() - 0.5) * 0.03,
          opacity: 0.35 + Math.random() * 0.5,
          type: i % 2 === 0 ? 'petal' : 'bokeh',
          bokehRadius: 10 + Math.random() * 30,
        });
      }
    } else {
      // Realistic Normal Mode: Natural Twirling Green Willow Leaves, Dandelion Fluff & Sun-Dappled Forest Motes
      // 1. Fluttering Willow & Eucalyptus Leaves (30 items)
      const leafCount = 32;
      for (let i = 0; i < leafCount; i++) {
        particles.push({
          type: 'leaf',
          x: Math.random() * width,
          y: Math.random() * height,
          size: 8 + Math.random() * 9,
          speedY: 0.5 + Math.random() * 0.9,
          speedX: 0.6 + Math.random() * 0.8,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.015 + Math.random() * 0.02,
          angle: Math.random() * Math.PI * 2,
          rotateSpeed: (Math.random() - 0.5) * 0.025,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: 0.02 + Math.random() * 0.03,
          opacity: 0.45 + Math.random() * 0.45,
          color1: Math.random() > 0.5 ? '#10b981' : '#059669', // Emerald / Forest
          color2: Math.random() > 0.5 ? '#34d399' : '#6ee7b7', // Mint / Soft Sage
        });
      }

      // 2. Floating Dandelion Seed Parachutes (22 items)
      const dandelionCount = 22;
      for (let i = 0; i < dandelionCount; i++) {
        particles.push({
          type: 'dandelion',
          x: Math.random() * width,
          y: Math.random() * height,
          size: 5 + Math.random() * 5,
          speedY: 0.25 + Math.random() * 0.45,
          speedX: 0.5 + Math.random() * 0.7,
          driftAngle: Math.random() * Math.PI * 2,
          driftSpeed: 0.01 + Math.random() * 0.02,
          opacity: 0.4 + Math.random() * 0.4,
        });
      }

      // 3. Serene Sun-Dappled Forest Light Motes (24 items)
      const moteCount = 24;
      for (let i = 0; i < moteCount; i++) {
        particles.push({
          type: 'mote',
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 12 + Math.random() * 24,
          speedY: (Math.random() - 0.5) * 0.3,
          speedX: (Math.random() - 0.5) * 0.3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.02,
          color: Math.random() > 0.5 ? '52, 211, 153' : '110, 231, 183', // emerald / soft jade
        });
      }
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (mood === 'sad') {
        // Draw realistic rain
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
        for (let p of particles) {
          if (p.type === 'drop') {
            ctx.lineWidth = p.thickness;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - 2, p.y + p.length);
            ctx.stroke();

            p.y += p.speed;
            p.x -= 1;
            if (p.y > height) {
              p.y = -p.length;
              p.x = Math.random() * width;
            }
          } else {
            // Condensation drop on glass
            ctx.fillStyle = `rgba(186, 230, 253, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            p.y += p.slideSpeed;
            if (p.y > height) {
              p.y = 0;
              p.x = Math.random() * width;
            }
          }
        }
      } else if (mood === 'gussa') {
        // Draw realistic glowing embers
        for (let p of particles) {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX;
          p.opacity -= p.decay;

          if (p.opacity <= 0 || p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.opacity = 0.4 + Math.random() * 0.6;
          }
        }
      } else if (mood === 'happy') {
        // Draw realistic sunbeams & drifting petals
        for (let p of particles) {
          if (p.type === 'petal') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = `rgba(251, 113, 133, ${p.opacity})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            p.y += p.speedY;
            p.x += Math.sin(p.angle) * 0.8;
            p.angle += p.angleSpeed;

            if (p.y > height + 20) {
              p.y = -20;
              p.x = Math.random() * width;
            }
          } else {
            // Golden bokeh
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.bokehRadius);
            grad.addColorStop(0, `rgba(251, 191, 36, ${p.opacity * 0.4})`);
            grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.bokehRadius, 0, Math.PI * 2);
            ctx.fill();

            p.y += p.speedY * 0.5;
            if (p.y > height + 50) {
              p.y = -50;
              p.x = Math.random() * width;
            }
          }
        }
      } else {
        // Draw Realistic Normal Mode: Twirling Willow Leaves, Dandelion Parachutes & Sun-Dappled Forest Motes
        for (let p of particles) {
          if (p.type === 'leaf') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            // 3D tumble flip along the horizontal axis
            const scaleFlip = Math.cos(p.flip);
            ctx.scale(Math.abs(scaleFlip) < 0.1 ? 0.1 : scaleFlip, 1);

            // Leaf gradient body
            const leafGrad = ctx.createLinearGradient(0, -p.size, 0, p.size);
            leafGrad.addColorStop(0, p.color1);
            leafGrad.addColorStop(1, p.color2);
            ctx.fillStyle = leafGrad;
            ctx.globalAlpha = p.opacity;

            // Curving organic leaf shape
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.bezierCurveTo(p.size * 0.65, -p.size * 0.4, p.size * 0.55, p.size * 0.6, 0, p.size);
            ctx.bezierCurveTo(-p.size * 0.55, p.size * 0.6, -p.size * 0.65, -p.size * 0.4, 0, -p.size);
            ctx.fill();

            // Delicate leaf central vein
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 0.85);
            ctx.lineTo(0, p.size * 0.85);
            ctx.stroke();

            ctx.restore();

            // Leaf movement physics
            p.sway += p.swaySpeed;
            p.angle += p.rotateSpeed;
            p.flip += p.flipSpeed;
            p.y += p.speedY;
            p.x += Math.sin(p.sway) * p.speedX;

            if (p.y > height + 25) {
              p.y = -25;
              p.x = Math.random() * width;
            }
          } else if (p.type === 'dandelion') {
            // Realistic Dandelion Parachute
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.globalAlpha = p.opacity;

            // Tiny brown/amber seed
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.ellipse(0, p.size * 0.7, 1.2, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // White stem filament
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(0, p.size * 0.7);
            ctx.lineTo(0, 0);
            ctx.stroke();

            // Radial feather bristles
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.lineWidth = 0.5;
            const rays = 7;
            for (let r = 0; r < rays; r++) {
              const rayAngle = -Math.PI / 2 + ((r - (rays - 1) / 2) * (Math.PI / 5));
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(rayAngle) * p.size, Math.sin(rayAngle) * p.size);
              ctx.stroke();
            }

            ctx.restore();

            p.driftAngle += p.driftSpeed;
            p.y += p.speedY;
            p.x += Math.cos(p.driftAngle) * p.speedX;

            if (p.y > height + 20) {
              p.y = -20;
              p.x = Math.random() * width;
            }
          } else if (p.type === 'mote') {
            // Sun-dappled forest light mote
            p.pulse += p.pulseSpeed;
            const currentAlpha = 0.15 + (Math.sin(p.pulse) + 1) * 0.12;

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, `rgba(${p.color}, ${currentAlpha})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mood]);

  return (
    <div className="pointer-events-none select-none">
      {/* Dynamic Realistic Canvas Effect Layer behind all interactive content */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      />

      {/* Mood-Specific Vignettes & Realistic Visual Overlays with Smooth Framer Motion */}
      <AnimatePresence mode="wait">
        {mood === 'happy' && (
          <motion.div
            key="happy-rays"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          >
            {/* Top-Right Realistic God Rays / Sunbeam */}
            <div className="absolute -top-40 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-amber-300/40 via-yellow-200/20 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-[300px] h-full bg-gradient-to-b from-amber-200/15 via-pink-200/10 to-transparent transform -rotate-12 blur-2xl pointer-events-none" />
          </motion.div>
        )}

        {mood === 'sad' && (
          <motion.div
            key="sad-fog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          >
            {/* Realistic Rainy Window Glass Tint & Mist Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-blue-950/25 to-slate-900/50 backdrop-blur-[0.5px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.45)_100%)] pointer-events-none" />
          </motion.div>
        )}

        {mood === 'gussa' && (
          <motion.div
            key="gussa-heat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          >
            {/* Realistic Molten Heatwave Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(220,38,38,0.25)_100%)] animate-pulse-subtle pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-red-600/20 via-orange-500/10 to-transparent blur-xl pointer-events-none" />
          </motion.div>
        )}

        {mood === 'normal' && (
          <motion.div
            key="normal-breeze"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          >
            {/* Realistic Sunlit Forest Canopy (Komorebi light filtering through leaves) */}
            <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-300/25 via-teal-200/15 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-1/3 w-[350px] h-full bg-gradient-to-b from-emerald-200/15 via-teal-100/10 to-transparent transform rotate-6 blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_75%)] pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
