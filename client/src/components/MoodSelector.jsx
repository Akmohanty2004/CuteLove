import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Meh, Frown, Flame, Send, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMoods } from '../hooks/useMoods';

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'from-amber-400 to-rose-400', border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-800' },
  { id: 'normal', label: 'Normal', emoji: '😌', color: 'from-emerald-400 to-teal-400', border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-800' },
  { id: 'sad', label: 'Sad', emoji: '🥺', color: 'from-blue-400 to-indigo-400', border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-800' },
  { id: 'gussa', label: 'Gussa', emoji: '😤', color: 'from-rose-500 to-red-600', border: 'border-rose-400', bg: 'bg-rose-50', text: 'text-rose-800' },
];

export const MoodSelector = ({ theme }) => {
  const { user, partner, updateCurrentUserMood } = useAuth();
  const { updateMood, isUpdatingMood } = useMoods();
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const currentMood = user?.currentMood || 'happy';
  const partnerMood = partner?.currentMood || 'happy';

  const partnerMoodObj = MOODS.find((m) => m.id === partnerMood) || MOODS[0];

  const handleSelectMood = async (moodId) => {
    try {
      if (updateCurrentUserMood) {
        updateCurrentUserMood(moodId);
      }
      await updateMood({ mood: moodId, note });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      setNote('');
    } catch (err) {
      console.error('Failed to update mood', err);
    }
  };

  const isDark = theme?.isDark;

  return (
    <div className={`rounded-3xl p-5 md:p-6 transition-all duration-700 ${theme?.cardBg || 'glass-card'}`}>
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Your Mood Controller */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className={`text-base font-serif font-bold transition-colors duration-700 ${theme?.headingText || 'text-slate-800'}`}>
                How is your heart feeling, {user?.displayName}?
              </h3>
              <p className={`text-xs transition-colors duration-700 ${theme?.subText || 'text-slate-500'}`}>
                Selecting a mood transforms the full theme, weather &amp; realistic ambience on both screens!
              </p>
            </div>
            {isSuccess && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Synced to Both!
              </span>
            )}
          </div>

          {/* 4 Mood Buttons with Framer Motion Physics */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {MOODS.map((m) => {
              const isSelected = currentMood === m.id;
              return (
                <motion.button
                  key={m.id}
                  layout
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.94 }}
                  animate={isSelected ? { y: [0, -3, 0] } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  onClick={() => handleSelectMood(m.id)}
                  disabled={isUpdatingMood}
                  className={`group relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? `${m.bg} ${m.border} ring-2 ring-rose-400 shadow-lg scale-105`
                      : isDark
                      ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                      : 'bg-white/60 border-slate-100 hover:bg-white hover:border-rose-200'
                  }`}
                >
                  <motion.span
                    animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-xl sm:text-3xl transition-transform group-hover:scale-125"
                  >
                    {m.emoji}
                  </motion.span>
                  <span className={`text-[10px] sm:text-xs font-bold mt-1 ${isSelected ? m.text : isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {m.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Optional reason / note */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a thought (e.g. Missing you, tired from work...)"
              className={`flex-1 px-3.5 py-2 text-xs rounded-xl border focus:outline-hidden focus:border-rose-400 transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 font-medium'
                  : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500 font-medium shadow-xs'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSelectMood(currentMood);
              }}
            />
            {note && (
              <button
                onClick={() => handleSelectMood(currentMood)}
                disabled={isUpdatingMood}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-medium cursor-pointer shadow-sm"
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* Partner's Live Mood Card with Framer Motion Sync */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className={`lg:w-72 p-4 rounded-2xl border flex items-center gap-4 transition-colors duration-700 ${
            isDark
              ? 'bg-slate-800/60 border-slate-700'
              : 'bg-gradient-to-br from-rose-50/80 to-pink-50/50 border-rose-100/80'
          }`}
        >
          <div className="relative">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center text-3xl border ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-rose-100'
              }`}
            >
              {partnerMoodObj.emoji}
            </motion.div>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-1 -right-1 text-xs"
            >
              ❤️
            </motion.span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">
              {partner?.displayName || 'Partner'}'s Mood
            </div>
            <div className={`text-sm font-bold truncate transition-colors duration-700 ${theme?.headingText || 'text-slate-800'}`}>
              Feeling {partnerMoodObj.label}
            </div>
            <p className={`text-xs italic truncate mt-0.5 transition-colors duration-700 ${theme?.subText || 'text-slate-500'}`}>
              {partner?.customStatus || 'Connected in love'}
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
