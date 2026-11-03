import React, { useState } from 'react';
import { Image, Video, Eye, EyeOff, Trash2, Search, Filter, Lock, Plus, Calendar, User } from 'lucide-react';
import { useMemories } from '../hooks/useMemories';
import { useAuth } from '../context/AuthContext';
import { MOOD_THEMES } from '../utils/moodThemes';

export const MemoryVault = ({ onOpenUpload }) => {
  const [mediaType, setMediaType] = useState('all');
  const [uploader, setUploader] = useState('all');
  const [search, setSearch] = useState('');

  const { vaultMemories, isVaultLoading, toggleVisibility, deleteMemory } = useMemories({
    mediaType,
    uploader,
    search,
  });

  const { user, activeMoodTheme } = useAuth();
  const theme = MOOD_THEMES[activeMoodTheme] || MOOD_THEMES.happy;
  const [deletingId, setDeletingId] = useState(null);

  const handleToggle = async (id, e) => {
    e.stopPropagation();
    try {
      await toggleVisibility(id);
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this memory from the vault?')) {
      try {
        setDeletingId(id);
        await deleteMemory(id);
      } catch (err) {
        console.error('Delete error:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl bg-gradient-to-tr ${theme.primaryBtn} text-white shadow-md`}>
              <Lock className="w-4 h-4" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-serif font-bold transition-colors ${theme.headingText}`}>
              Memory Vault
            </h2>
          </div>
          <p className={`text-xs mt-1 transition-colors ${theme.subText}`}>
            Complete private archive. Toggle "Show on Dashboard" to share memories on the home feed.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r ${theme.primaryBtn} text-white font-semibold text-xs shadow-md cursor-pointer transition-all active:scale-95`}
        >
          <Plus className="w-4 h-4" />
          <span>Upload to Vault</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl transition-all duration-700 ${theme.cardBg}`}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search captions or moments..."
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-hidden focus:border-rose-400 transition-colors ${
              theme.isDark
                ? 'bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-400'
                : 'bg-white/80 border-slate-200 text-slate-800 placeholder:text-slate-400'
            }`}
          />
        </div>

        {/* Media Type Filter */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${theme.isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
          <button
            onClick={() => setMediaType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              mediaType === 'all' ? `${theme.tabActive} shadow-xs` : theme.subText
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMediaType('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              mediaType === 'image' ? `${theme.tabActive} shadow-xs` : theme.subText
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setMediaType('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              mediaType === 'video' ? `${theme.tabActive} shadow-xs` : theme.subText
            }`}
          >
            Videos
          </button>
        </div>

        {/* Uploader Filter */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${theme.isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
          <button
            onClick={() => setUploader('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              uploader === 'all' ? 'bg-rose-600 text-white shadow-xs' : theme.subText
            }`}
          >
            Both
          </button>
          <button
            onClick={() => setUploader('ashis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              uploader === 'ashis' ? 'bg-rose-600 text-white shadow-xs' : theme.subText
            }`}
          >
            Ashis
          </button>
          <button
            onClick={() => setUploader('kirti')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              uploader === 'kirti' ? 'bg-rose-600 text-white shadow-xs' : theme.subText
            }`}
          >
            Kirti
          </button>
        </div>
      </div>

      {/* Grid of Vault Items */}
      {isVaultLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-card rounded-3xl h-72 animate-pulse bg-rose-50/50" />
          ))}
        </div>
      ) : vaultMemories.length === 0 ? (
        <div className={`rounded-3xl p-12 text-center flex flex-col items-center justify-center border ${theme.cardBg}`}>
          <Lock className="w-12 h-12 text-rose-400 stroke-1 mb-3" />
          <h4 className={`text-base font-bold ${theme.headingText}`}>No vault memories match your filter</h4>
          <p className={`text-xs ${theme.subText} mt-1`}>Upload a photo or adjust your filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaultMemories.map((mem) => {
            return (
              <div
                key={mem._id}
                className={`overflow-hidden flex flex-col transition-all duration-700 ${theme.cardBg} ${theme.cardShape} ${theme.cardGlow}`}
              >
                {/* Media thumbnail */}
                <div className={`relative aspect-4/3 w-full bg-slate-900 overflow-hidden ${theme.imageShape}`}>
                  {mem.mediaType === 'video' ? (
                    <video src={mem.url} className={`w-full h-full object-cover ${theme.imgFilter}`} controls playsInline />
                  ) : (
                    <img src={mem.url} alt={mem.caption} className={`w-full h-full object-cover ${theme.imgFilter}`} />
                  )}

                  {/* Dashboard status pill */}
                  <div
                    className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-xs ${
                      mem.isVisibleOnDashboard
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-black/60 text-slate-200'
                    }`}
                  >
                    {mem.isVisibleOnDashboard ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{mem.isVisibleOnDashboard ? 'On Dashboard' : 'Private Vault'}</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(mem._id, e)}
                    disabled={deletingId === mem._id}
                    title="Delete Memory"
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info & Visibility Toggle Controls */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className={`flex items-center justify-between text-[11px] mb-2 ${theme.subText}`}>
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3 h-3 text-rose-500" />
                        {mem.uploaderName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(mem.date || mem.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className={`text-xs font-serif line-clamp-2 ${theme.headingText}`}>
                      {mem.caption ? `"${mem.caption}"` : <span className="italic opacity-60">No caption</span>}
                    </p>
                  </div>

                  {/* Toggle Dashboard Visibility Button */}
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between ${theme.borderAccent}`}>
                    <span className={`text-[11px] font-medium ${theme.subText}`}>
                      Show on Dashboard
                    </span>
                    <button
                      onClick={(e) => handleToggle(mem._id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        mem.isVisibleOnDashboard
                          ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-200 hover:bg-rose-100 border border-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {mem.isVisibleOnDashboard ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
