import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Lock, Shield, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // 30-day login persistence
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter your secret password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Single login section: sends password only; server automatically identifies Ashis or Kirti!
      await login(password.trim(), rememberMe);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Incorrect password for Ashis or Kirti.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (pass) => {
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-rose-100/70 via-pink-50/50 to-amber-50/40 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 relative z-10"
      >
        {/* Heart Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 mb-3">
            <Heart className="w-8 h-8 fill-white" />
          </div>
          <span className="text-xs uppercase tracking-widest text-rose-500 font-semibold px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-2">
            Exclusive Two-Person Sanctuary
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
            Ashis <span className="text-rose-500">&amp;</span> Kirti
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your secret password to unlock our shared space
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center"
          >
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Single Password Input (No separate Ashis / Kirti selection) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                <span>Your Secret Password</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Auto-detects identity
              </span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 30-Day Login Persistence Checkbox */}
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Stay logged in for 30 days
                </p>
                <p className="text-[10px] text-emerald-700">
                  Secure HTTP-Only session stays active for a full month
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Open Our Space</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick-fill helper chips for convenience */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 mb-2">Quick password presets:</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ashis123')}
                className="text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 cursor-pointer transition-colors"
              >
                Ashis's Key (<code className="font-mono text-[10px]">ashis123</code>)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('kirti123')}
                className="text-[11px] font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl border border-pink-200 cursor-pointer transition-colors"
              >
                Kirti's Key (<code className="font-mono text-[10px]">kirti123</code>)
              </button>
            </div>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
