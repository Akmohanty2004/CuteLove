import React, { useState } from 'react';
import { Shield, Clock, LogOut, Check, X, RefreshCw, Sparkles, User, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { user, partner, sessionDaysRemaining, sessionExpiresAt, logout, checkAuth } = useAuth();
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/auth/profile', { customStatus });
      await checkAuth();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSilentRefresh = async () => {
    setIsRefreshing(true);
    try {
      await api.post('/auth/refresh');
      await checkAuth();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2500);
    } catch (err) {
      console.error('Refresh error', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Progress for 30-day session
  const daysPassed = Math.max(0, 30 - (sessionDaysRemaining || 30));
  const progressPercent = Math.min(100, Math.round(((30 - sessionDaysRemaining) / 30) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Shield className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-serif font-bold text-slate-800">
              Couple &amp; Session Settings
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Private configuration for Ashis and Kirti
          </p>
        </div>

        {/* 30-Day Session Details Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              30-Day Login Persistence
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              {sessionDaysRemaining} days left
            </span>
          </div>

          <p className="text-[11px] text-emerald-700/90 leading-relaxed mb-3">
            Your login is preserved with an HTTP-Only 30-day token so you stay logged in smoothly without re-entering credentials for a full month.
          </p>

          {/* Progress bar */}
          <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.max(5, 100 - progressPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-emerald-700">
            <span>Day {daysPassed} of 30</span>
            {refreshSuccess ? (
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Session Extended 30 Days!
              </span>
            ) : (
              <button
                onClick={handleSilentRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer underline"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Renew 30 Days Now
              </button>
            )}
          </div>
        </div>

        {/* Profile Status form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 mb-5">
          <label className="block text-xs font-semibold text-slate-700">
            Your Romantic Status (Visible to {partner?.displayName})
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="e.g. Loving you more every second ❤️"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:border-rose-400 text-slate-800"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : 'Save'}
            </button>
          </div>
        </form>

        {/* Media Storage Status */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-rose-500" />
            <div>
              <div className="font-semibold text-slate-700">Cloudinary Media Vault</div>
              <div className="text-[10px] text-slate-400">Direct CDN streaming &amp; auto-optimization</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-white px-2.5 py-1 rounded-full border border-slate-200 text-slate-600">
            Ready
          </span>
        </div>

        {/* Logout Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Logged in as <strong className="text-slate-700">{user?.displayName}</strong>
          </span>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs border border-rose-200 cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
