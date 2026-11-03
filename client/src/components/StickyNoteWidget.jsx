import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pin, Trash2, Send, Plus, Sparkles, StickyNote as NoteIcon, Check } from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MOOD_THEMES } from '../utils/moodThemes';
import confetti from 'canvas-confetti';

// Crystal-clear, high-contrast, beautiful paper notes for ALL modes
const COLORS = {
  rose: {
    bg: 'bg-rose-100',
    border: 'border-2 border-rose-300',
    text: 'text-slate-950',
    shadow: 'shadow-md shadow-rose-500/15',
    accent: 'text-rose-950',
    pinBg: 'bg-rose-500',
    tagBg: 'bg-rose-200/80 text-rose-950',
  },
  amber: {
    bg: 'bg-amber-100',
    border: 'border-2 border-amber-300',
    text: 'text-slate-950',
    shadow: 'shadow-md shadow-amber-500/15',
    accent: 'text-amber-950',
    pinBg: 'bg-amber-500',
    tagBg: 'bg-amber-200/80 text-amber-950',
  },
  emerald: {
    bg: 'bg-emerald-100',
    border: 'border-2 border-emerald-300',
    text: 'text-slate-950',
    shadow: 'shadow-md shadow-emerald-500/15',
    accent: 'text-emerald-950',
    pinBg: 'bg-emerald-600',
    tagBg: 'bg-emerald-200/80 text-emerald-950',
  },
  indigo: {
    bg: 'bg-indigo-100',
    border: 'border-2 border-indigo-300',
    text: 'text-slate-950',
    shadow: 'shadow-md shadow-indigo-500/15',
    accent: 'text-indigo-950',
    pinBg: 'bg-indigo-600',
    tagBg: 'bg-indigo-200/80 text-indigo-950',
  },
  violet: {
    bg: 'bg-purple-100',
    border: 'border-2 border-purple-300',
    text: 'text-slate-950',
    shadow: 'shadow-md shadow-purple-500/15',
    accent: 'text-purple-950',
    pinBg: 'bg-purple-600',
    tagBg: 'bg-purple-200/80 text-purple-950',
  },
};

export const StickyNoteWidget = () => {
  const queryClient = useQueryClient();
  const { user, activeMoodTheme } = useAuth();
  const { partnerTyping, emitTyping } = useSocket();
  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;

  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('rose');
  const [isPinned, setIsPinned] = useState(false);

  // TanStack Query for notes
  const { data, isLoading } = useQuery({
    queryKey: ['stickyNotes'],
    queryFn: async () => {
      const res = await api.get('/notes');
      return res.data?.notes || [];
    },
  });

  const notes = data || [];

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (newNote) => {
      const res = await api.post('/notes', newNote);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickyNotes'] });
      setContent('');
      emitTyping(false);
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#fb7185', '#34d399', '#fbbf24'],
      });
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/notes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickyNotes'] });
    },
  });

  // Pin mutation
  const pinMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/notes/${id}/pin`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickyNotes'] });
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ content, color: selectedColor, isPinned });
  };

  const handleInputChange = (e) => {
    setContent(e.target.value);
    emitTyping(e.target.value.length > 0);
  };

  // Mode-adaptive Framer Motion hover physics
  const getNoteHoverProps = (idx) => {
    const tilt = idx % 2 === 0 ? 1.5 : -1.5;
    if (activeMoodTheme === 'happy') {
      return {
        whileHover: { scale: 1.05, y: -6, rotate: tilt, transition: { type: 'spring', stiffness: 380, damping: 14 } },
        whileTap: { scale: 0.98 },
      };
    } else if (activeMoodTheme === 'normal') {
      return {
        whileHover: { scale: 1.03, y: -3, rotate: tilt * 0.7, transition: { duration: 0.35, ease: 'easeOut' } },
        whileTap: { scale: 0.98 },
      };
    } else if (activeMoodTheme === 'gussa') {
      return {
        whileHover: { scale: 1.06, y: -5, rotate: tilt * 1.3, transition: { type: 'spring', stiffness: 450, damping: 12 } },
        whileTap: { scale: 0.96 },
      };
    } else {
      // sad
      return {
        whileHover: { scale: 1.035, y: -4, rotate: tilt * 0.8, transition: { duration: 0.4, ease: 'easeOut' } },
        whileTap: { scale: 0.98 },
      };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`p-5 md:p-7 transition-all duration-700 ${theme.cardBg} ${theme.cardShape} ${theme.cardGlow}`}
    >
      {/* High-Contrast Crystal-Clear Header Bar (Fully Legible in ALL Modes) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white/95 dark:bg-slate-950/90 border-2 border-slate-200/90 dark:border-white/20 shadow-md">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 10 }}
            className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${theme.primaryBtn} text-white flex items-center justify-center shadow-md`}
          >
            <NoteIcon className="w-5 h-5" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-xl font-serif font-black tracking-tight text-slate-950 dark:text-white drop-shadow-xs">
                Secret Couple Sticky Notes
              </h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs hidden sm:inline-flex ${theme.badgeBg}`}>
                ⚡ Live Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-amber-200 mt-0.5">
              Leave sweet reminders &amp; loving messages that sync instantly
            </p>
          </div>
        </div>

        {partnerTyping && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/90 px-3.5 py-1.5 rounded-full animate-pulse border-2 border-rose-300 dark:border-rose-500 shadow-sm"
          >
            <span>✍️</span> Partner is typing a sweet note...
          </motion.span>
        )}
      </div>

      {/* Note Input Box with High Visibility & Contrast */}
      <form
        onSubmit={handleSend}
        className="mb-6 p-4 rounded-2xl border-2 transition-colors shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
      >
        <textarea
          rows={2}
          value={content}
          onChange={handleInputChange}
          placeholder="Leave a secret note (e.g. 'I left your favorite snack in the fridge ❤️')..."
          className="w-full text-xs sm:text-sm font-serif font-medium bg-transparent border-0 focus:ring-0 focus:outline-hidden resize-none text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
          {/* Color selectors */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hidden sm:inline mr-1">
              Color:
            </span>
            {Object.keys(COLORS).map((c) => (
              <motion.button
                key={c}
                type="button"
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer shadow-xs ${
                  selectedColor === c
                    ? 'ring-2 ring-rose-500 ring-offset-2 scale-110'
                    : 'opacity-80 hover:opacity-100'
                } ${
                  c === 'rose'
                    ? 'bg-rose-300 border-rose-400'
                    : c === 'amber'
                    ? 'bg-amber-300 border-amber-400'
                    : c === 'emerald'
                    ? 'bg-emerald-300 border-emerald-400'
                    : c === 'indigo'
                    ? 'bg-indigo-300 border-indigo-400'
                    : 'bg-purple-300 border-purple-400'
                }`}
              />
            ))}

            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin note' : 'Pin to top'}
              className={`p-1.5 rounded-xl text-xs font-bold cursor-pointer ml-2 transition-all flex items-center gap-1 border ${
                isPinned
                  ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-950' : ''}`} />
              <span className="text-[10px] hidden md:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
            </motion.button>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!content.trim() || createMutation.isPending}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r ${theme.primaryBtn} disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer transition-all`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post Note</span>
          </motion.button>
        </div>
      </form>

      {/* Grid of Sticky Notes with High-Contrast Paper Styling */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-amber-100/50 animate-pulse border-2 border-amber-200" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="py-8 text-center rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <NoteIcon className="w-8 h-8 mx-auto text-amber-500/80 mb-2" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No secret sticky notes posted yet.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Surprise {user?.username === 'ashis' ? 'Kirti' : 'Ashis'} with a sweet note above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {notes.map((note, idx) => {
              const colorConfig = COLORS[note.color] || COLORS.rose;
              const hoverProps = getNoteHoverProps(idx);

              return (
                <motion.div
                  key={note._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -15 }}
                  transition={{ duration: 0.35 }}
                  {...hoverProps}
                  className={`relative p-5 rounded-2xl ${colorConfig.border} ${colorConfig.bg} ${colorConfig.shadow} flex flex-col justify-between min-h-[125px] cursor-pointer`}
                >
                  {/* Pin Badge on Paper */}
                  {note.isPinned && (
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute -top-3 right-4 w-6 h-6 rounded-full ${colorConfig.pinBg} text-white flex items-center justify-center shadow-md border-2 border-white`}
                    >
                      <Pin className="w-3 h-3 fill-white" />
                    </motion.div>
                  )}

                  {/* Note Message Content: 100% Bold High-Contrast Text */}
                  <p className="text-sm sm:text-base font-serif font-black leading-relaxed text-slate-950 pr-4">
                    "{note.content}"
                  </p>

                  {/* Bottom Bar: Sender Tag, Date, and Actions */}
                  <div className="mt-4 pt-2.5 border-t border-black/15 flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${colorConfig.tagBg}`}>
                      From {note.senderName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => pinMutation.mutate(note._id)}
                        title={note.isPinned ? 'Unpin' : 'Pin to top'}
                        className="p-1 rounded-md text-slate-800 hover:text-black hover:bg-black/10 transition-colors cursor-pointer"
                      >
                        <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-slate-900' : ''}`} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.25, rotate: 12 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteMutation.mutate(note._id)}
                        title="Delete note"
                        className="p-1 rounded-md text-rose-800 hover:text-rose-950 hover:bg-rose-200/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
