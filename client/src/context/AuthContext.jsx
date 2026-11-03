import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [sessionDaysRemaining, setSessionDaysRemaining] = useState(30);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const [activeMoodTheme, setActiveMoodThemeState] = useState(() => {
    return localStorage.getItem('ashis_kirti_active_mood') || 'happy';
  });
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'whatsapp'
  const [isLoading, setIsLoading] = useState(true);

  const setActiveMoodTheme = (mood) => {
    if (!mood) return;
    try {
      localStorage.setItem('ashis_kirti_active_mood', mood);
    } catch (e) {
      // ignore
    }
    setActiveMoodThemeState(mood);
  };

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

        // Compute the latest active mood between Ashis and Kirti based on most recent update timestamp
        const userTime = res.data.user?.lastMoodUpdate ? new Date(res.data.user.lastMoodUpdate).getTime() : 0;
        const partnerTime = res.data.partner?.lastMoodUpdate ? new Date(res.data.partner.lastMoodUpdate).getTime() : 0;

        let activeMood = 'happy';
        if (userTime || partnerTime) {
          activeMood = userTime >= partnerTime
            ? (res.data.user?.currentMood || 'happy')
            : (res.data.partner?.currentMood || 'happy');
        } else {
          activeMood = res.data.user?.currentMood || res.data.partner?.currentMood || 'happy';
        }
        setActiveMoodTheme(activeMood);
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
      const userTime = res.data.user?.lastMoodUpdate ? new Date(res.data.user.lastMoodUpdate).getTime() : 0;
      const partnerTime = res.data.partner?.lastMoodUpdate ? new Date(res.data.partner.lastMoodUpdate).getTime() : 0;
      let activeMood = 'happy';
      if (userTime || partnerTime) {
        activeMood = userTime >= partnerTime
          ? (res.data.user?.currentMood || 'happy')
          : (res.data.partner?.currentMood || 'happy');
      } else {
        activeMood = res.data.user?.currentMood || res.data.partner?.currentMood || 'happy';
      }
      setActiveMoodTheme(activeMood);
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
    const now = new Date().toISOString();
    setUser((prev) => (prev ? { ...prev, currentMood: mood, lastMoodUpdate: now } : prev));
    // Instantly transform whole app theme on own side!
    setActiveMoodTheme(mood);
  };

  const updatePartnerMood = (mood, note) => {
    const now = new Date().toISOString();
    setPartner((prev) =>
      prev
        ? {
            ...prev,
            currentMood: mood,
            customStatus: note || prev?.customStatus,
            lastMoodUpdate: now,
          }
        : prev
    );
    // Instantly transform whole app theme on partner's side in real-time!
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
