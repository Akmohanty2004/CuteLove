import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [sessionDaysRemaining, setSessionDaysRemaining] = useState(30);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const [activeMoodTheme, setActiveMoodTheme] = useState('happy');
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'whatsapp'
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize 'dark' class on document.documentElement with mood for 100% reliable contrast
  useEffect(() => {
    const isDark = activeMoodTheme === 'sad' || activeMoodTheme === 'gussa';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [activeMoodTheme]);

  // Synchronize hash with currentPage for seamless browser back/forward
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#whatsapp' || hash === '#chat') {
        setCurrentPage('whatsapp');
      } else {
        setCurrentPage('dashboard');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page === 'whatsapp') {
      window.location.hash = '#whatsapp';
    } else {
      window.location.hash = '';
    }
  };

  // Check 30-day session validity on application launch
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/verify');
      if (res.data.success) {
        setUser(res.data.user);
        setPartner(res.data.partner);
        setSessionDaysRemaining(res.data.user.sessionDaysRemaining ?? 30);
        setSessionExpiresAt(res.data.user.sessionExpiresAt);

        // Prioritize sad or gussa mood if partner is feeling low, otherwise user mood
        const primaryMood = res.data.partner?.currentMood === 'sad' || res.data.partner?.currentMood === 'gussa'
          ? res.data.partner.currentMood
          : res.data.user.currentMood || 'happy';
        setActiveMoodTheme(primaryMood);
      } else {
        setUser(null);
        setPartner(null);
      }
    } catch (err) {
      // Not logged in or session expired
      setUser(null);
      setPartner(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (arg1, arg2 = true, arg3 = null) => {
    let payload;
    if (typeof arg2 === 'string') {
      // Called as login(username, password, rememberMe)
      payload = { username: arg1, password: arg2, rememberMe: arg3 !== null ? arg3 : true };
    } else {
      // Called as login(password, rememberMe)
      payload = { password: arg1, rememberMe: arg2 !== undefined ? arg2 : true };
    }
    const res = await api.post('/auth/login', payload);
    if (res.data.success) {
      setUser(res.data.user);
      setPartner(res.data.partner);
      setSessionDaysRemaining(res.data.user.sessionDaysRemaining ?? 30);
      const primaryMood = res.data.partner?.currentMood === 'sad' || res.data.partner?.currentMood === 'gussa'
        ? res.data.partner.currentMood
        : res.data.user.currentMood || 'happy';
      setActiveMoodTheme(primaryMood);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setUser(null);
      setPartner(null);
      setActiveMoodTheme('happy');
    }
  };

  const updateCurrentUserMood = (mood) => {
    if (user) {
      setUser((prev) => ({ ...prev, currentMood: mood }));
    }
    // Update whole app theme on own side!
    setActiveMoodTheme(mood);
  };

  const updatePartnerMood = (mood, note) => {
    if (partner) {
      setPartner((prev) => ({ ...prev, currentMood: mood, customStatus: note || prev?.customStatus }));
    }
    // Update whole app theme on partner's side in real-time over Socket!
    setActiveMoodTheme(mood);
  };

  const updatePartnerPresence = (isOnline, lastActive = new Date()) => {
    setPartnerOnline(isOnline);
    if (partner) {
      setPartner((prev) => ({ ...prev, lastActive }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        partnerOnline,
        sessionDaysRemaining,
        sessionExpiresAt,
        activeMoodTheme,
        setActiveMoodTheme,
        currentPage,
        setCurrentPage,
        navigateTo,
        isLoading,
        login,
        logout,
        setUser,
        setPartner,
        updateCurrentUserMood,
        updatePartnerMood,
        updatePartnerPresence,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
