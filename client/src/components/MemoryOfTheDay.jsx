import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Camera, X } from 'lucide-react';
import { useMemories } from '../hooks/useMemories';
import { useAuth } from '../context/AuthContext';
import { MOOD_THEMES } from '../utils/moodThemes';

export const MemoryOfTheDay = () => {
  const { flashbackMemories } = useMemories();
  const { activeMoodTheme } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;

  if (!flashbackMemories || flashbackMemories.length === 0) return null;

  return (
    <>
      <div className={`p-5 md:p-6 mb-6 transition-all duration-700 ${theme.cardBg} ${theme.cardShape} ${theme.cardGlow}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-2xl bg-gradient-to-tr ${theme.primaryBtn} text-white shadow-md`}>
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-serif font-bold transition-colors ${theme.headingText}`}>
                  Memories of the Day — Flashback Collage
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border hidden sm:inline-flex ${theme.moodTagBg}`}>
                  {theme.moodTag}
                </span>
              </div>
              <p className={`text-xs transition-colors ${theme.subText}`}>
                Random precious moments from our journey together (Click any photo to view full size)
              </p>
            </div>
          </div>

          <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${theme.badgeBg}`}>
            <Sparkles className="w-3 h-3 text-rose-500" />
            Flashback
          </span>
        </div>

        {/* 4-Image Dynamic Collage Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {flashbackMemories.slice(0, 4).map((item, idx) => (
            <motion.div
              key={item._id || idx}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              onClick={() => setSelectedPhoto(item)}
              className={`group relative overflow-hidden aspect-square bg-slate-900 transition-all duration-700 cursor-pointer ${theme.imageShape} ${theme.borderAccent} border shadow-md`}
            >
              <img
                src={item.url}
                alt={item.caption || 'Memory of the day'}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${theme.imgFilter}`}
              />

              {/* Shimmer light pass */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-85 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                <span className="text-[10px] text-rose-200 font-semibold flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(item.date || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <p className="text-xs font-serif italic truncate mt-0.5">
                  {item.caption || `Uploaded by ${item.uploaderName}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox for Flashback Photo with Framer Motion Spring */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-rose-400 cursor-pointer transition-colors"
              >
                <X className="w-7 h-7" />
              </motion.button>

              <div className={`overflow-hidden max-h-[75vh] bg-black shadow-2xl ${theme.imageShape} border border-white/20`}>
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className={`max-h-[75vh] w-auto object-contain ${theme.imgFilter}`}
                />
              </div>

              {selectedPhoto.caption && (
                <div className="mt-3 text-center px-4 max-w-xl text-rose-100 text-sm font-serif italic">
                  "{selectedPhoto.caption}"
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
