import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  Heart,
  TrendingUp,
  Activity,
  Smile,
  Shield,
  Calendar,
} from 'lucide-react';
import { useMoods } from '../hooks/useMoods';
import { useAuth } from '../context/AuthContext';
import { MOOD_THEMES } from '../utils/moodThemes';

const MOOD_META = {
  4: { label: 'Happy', emoji: '😊', desc: 'Radiant & Joyful', color: '#10b981', bg: 'bg-emerald-500/20 text-emerald-300' },
  3: { label: 'Normal', emoji: '😌', desc: 'Serene & Calm', color: '#3b82f6', bg: 'bg-blue-500/20 text-blue-300' },
  2: { label: 'Sad', emoji: '🥺', desc: 'Needs Cuddles', color: '#8b5cf6', bg: 'bg-purple-500/20 text-purple-300' },
  1: { label: 'Gussa', emoji: '😤', desc: 'Send Kisses', color: '#f43f5e', bg: 'bg-rose-500/20 text-rose-300' },
};

// Deluxe Romantic Frosted Glass Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const ashisMeta = data.ashisScore ? MOOD_META[Math.round(data.ashisScore)] : null;
    const kirtiMeta = data.kirtiScore ? MOOD_META[Math.round(data.kirtiScore)] : null;

    return (
      <div className="p-4 rounded-2xl shadow-2xl backdrop-blur-xl bg-slate-950/92 border-2 border-rose-500/40 text-white text-xs min-w-[210px] space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-white/15">
          <span className="font-bold text-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {new Date(data.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="space-y-2">
          {data.ashisScore !== undefined && (
            <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
              <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                  A
                </span>
                <span>Ashis</span>
              </span>
              <span className="font-bold text-emerald-200">
                {ashisMeta?.emoji} {ashisMeta?.label}
              </span>
            </div>
          )}

          {data.kirtiScore !== undefined && (
            <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
              <span className="flex items-center gap-1.5 font-bold text-rose-300">
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                  K
                </span>
                <span>Kirti</span>
              </span>
              <span className="font-bold text-rose-200">
                {kirtiMeta?.emoji} {kirtiMeta?.label}
              </span>
            </div>
          )}

          {data.note && (
            <div className="mt-2 pt-2 border-t border-white/10 text-[11px] font-serif italic text-rose-200/90 leading-tight">
              "{data.note}"
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const MoodChart = () => {
  const [hours, setHours] = useState(24);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { timelineData = [], isTimelineLoading } = useMoods(hours);
  const { user, partner, activeMoodTheme } = useAuth();
  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;

  // Compute Couple Harmony & Stats
  const stats = useMemo(() => {
    if (!timelineData || timelineData.length === 0) {
      return { harmonyScore: 96, ashisAvg: 'Happy', kirtiAvg: 'Happy', totalCheckins: 0 };
    }

    let matching = 0;
    let totalCount = 0;
    let ashisSum = 0;
    let kirtiSum = 0;
    let ashisCount = 0;
    let kirtiCount = 0;

    timelineData.forEach((d) => {
      if (d.ashisScore !== undefined && d.kirtiScore !== undefined) {
        totalCount++;
        const diff = Math.abs(d.ashisScore - d.kirtiScore);
        if (diff <= 1) matching++;
      }
      if (d.ashisScore !== undefined) {
        ashisSum += d.ashisScore;
        ashisCount++;
      }
      if (d.kirtiScore !== undefined) {
        kirtiSum += d.kirtiScore;
        kirtiCount++;
      }
    });

    const harmonyScore = totalCount > 0 ? Math.round((matching / totalCount) * 100) : 98;
    const ashisAvgNum = ashisCount > 0 ? Math.round(ashisSum / ashisCount) : 4;
    const kirtiAvgNum = kirtiCount > 0 ? Math.round(kirtiSum / kirtiCount) : 4;

    return {
      harmonyScore: Math.max(88, harmonyScore),
      ashisAvg: MOOD_META[ashisAvgNum] || MOOD_META[4],
      kirtiAvg: MOOD_META[kirtiAvgNum] || MOOD_META[4],
      totalCheckins: timelineData.length,
    };
  }, [timelineData]);

  return (
    <div
      className={`transition-all duration-700 select-none ${
        isFullScreen
          ? 'fixed inset-0 z-50 p-4 sm:p-8 bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto text-white'
          : `p-5 sm:p-7 ${theme.cardBg} ${theme.cardShape} ${theme.cardGlow} shadow-2xl`
      }`}
    >
      {/* Background Ambient Glow Accent */}
      <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* TOP HEADER BAR: Title, Live Status & Time Range Controls */}
      {/* ========================================================= */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className={`p-2 rounded-xl bg-gradient-to-tr ${theme.primaryBtn} text-white shadow-md shadow-black/20`}>
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className={`text-lg sm:text-2xl font-serif font-black tracking-tight ${theme.headingText}`}>
              Couple Mood &amp; Emotional Timeline
            </h3>
            <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full border shadow-xs flex items-center gap-1.5 ${theme.moodTagBg}`}>
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Real-Time Biometric Sync</span>
            </span>
          </div>
          <p className={`text-xs sm:text-sm font-serif italic ${theme.subText}`}>
            Continuous emotional resonance graph tracking Ashis &amp; Kirti's shared heartbeats over time.
          </p>
        </div>

        {/* Action Controls: Range Selector & Fullscreen Toggle */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          {/* Time Range Pills */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10">
            {[
              { val: 24, label: '24 Hours' },
              { val: 72, label: '3 Days' },
              { val: 168, label: '7 Days' },
            ].map((r) => (
              <button
                key={r.val}
                onClick={() => setHours(r.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  hours === r.val
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Full Screen Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'View Full Screen'}
            className="p-2 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 border border-black/5 dark:border-white/10 cursor-pointer transition-colors shadow-xs"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ATTRACTIVE COUPLE HARMONY STAT CARDS */}
      {/* ========================================================= */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5">
        {/* Card 1: Emotional Resonance Index */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Harmony</span>
            </span>
            <span className="text-[10px] text-emerald-500 font-black">SYNCED</span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
            {stats.harmonyScore}%
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            In Deep Emotional Resonance
          </p>
        </div>

        {/* Card 2: Ashis Mood Trend */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-emerald-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-500 mb-1">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
                A
              </span>
              <span>Ashis</span>
            </span>
            <span className="text-sm">{stats.ashisAvg.emoji}</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-300 truncate">
            {stats.ashisAvg.label}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {stats.ashisAvg.desc}
          </p>
        </div>

        {/* Card 3: Kirti Mood Trend */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-rose-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-rose-500 mb-1">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black">
                K
              </span>
              <span>Kirti</span>
            </span>
            <span className="text-sm">{stats.kirtiAvg.emoji}</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-300 truncate">
            {stats.kirtiAvg.label}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {stats.kirtiAvg.desc}
          </p>
        </div>

        {/* Card 4: Total Synced Logs */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span>Milestone</span>
            </span>
            <span className="text-[10px] text-amber-500 font-bold">10/09/2020</span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
            {stats.totalCheckins}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Total Synced Check-ins
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CHART CONTAINER: Glowing Gradients & Smooth Curves */}
      {/* ========================================================= */}
      <div
        className={`relative z-10 w-full rounded-2xl overflow-hidden transition-all ${
          isFullScreen ? 'h-[62vh]' : 'h-72 sm:h-80'
        }`}
      >
        {isTimelineLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            <Sparkles className="w-4 h-4 animate-spin-slow mr-2 text-rose-400" />
            <span>Harmonizing real-time couple emotional curve...</span>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
            <Clock className="w-10 h-10 mb-2 text-rose-400 stroke-1" />
            <p className="font-bold text-slate-700 dark:text-slate-300">
              No mood check-ins recorded in this period yet.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Tap any mood above (Happy, Normal, Sad, Gussa) to instantly animate your emotional curve!
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                {/* SVG Glow Filter for Radiant Area Lines */}
                <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Ashis Multi-Stop Cyan-Emerald Gradient */}
                <linearGradient id="ashisGlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>

                {/* Kirti Multi-Stop Sunset Rose-Pink Gradient */}
                <linearGradient id="kirtiGlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
                  <stop offset="60%" stopColor="#fb7185" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Subtle Grid with Mood Guidance Lines */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f43f5e" opacity={0.12} />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: theme.isDark ? '#e2e8f0' : '#1e293b', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[1, 4]}
                ticks={[1, 2, 3, 4]}
                tickFormatter={(val) => {
                  if (val === 4) return '😊 Happy';
                  if (val === 3) return '😌 Normal';
                  if (val === 2) return '🥺 Sad';
                  if (val === 1) return '😤 Gussa';
                  return '';
                }}
                tick={{ fontSize: 11, fill: theme.isDark ? '#ffffff' : '#0f172a', fontWeight: 800 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />

              {/* Ashis Emotional Wave Area */}
              <Area
                type="monotone"
                dataKey="ashisScore"
                name="Ashis (Emerald Sync)"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#ashisGlowGrad)"
                activeDot={{
                  r: 6,
                  stroke: '#10b981',
                  strokeWidth: 3,
                  fill: '#ffffff',
                }}
                connectNulls
              />

              {/* Kirti Emotional Wave Area */}
              <Area
                type="monotone"
                dataKey="kirtiScore"
                name="Kirti (Rose Radiance)"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#kirtiGlowGrad)"
                activeDot={{
                  r: 6,
                  stroke: '#f43f5e',
                  strokeWidth: 3,
                  fill: '#ffffff',
                }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};