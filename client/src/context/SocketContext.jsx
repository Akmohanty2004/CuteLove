import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { triggerSprinklerEffect } from '../components/EmojiSprinkler';

const playNotificationTone = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now); // F5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25); // C6

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Audio context may be restricted
  }
};

const triggerNativeNotification = (title, body) => {
  try {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/heart.svg',
          badge: '/heart.svg',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  } catch (e) {
    // notification not permitted
  }
};

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, partner, updatePartnerMood, updatePartnerPresence } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  const [cheerUpAlert, setCheerUpAlert] = useState(null);
  const [incomingReaction, setIncomingReaction] = useState(null);
  const [newChatNotification, setNewChatNotification] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [chatPartnerTyping, setChatPartnerTyping] = useState(false);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (window.location.port === '5173'
        ? `http://${window.location.hostname}:5000`
        : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : window.location.origin);
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔗 Connected to couple space socket server');
      socket.emit('join_couple_space', {
        username: user.username,
        displayName: user.displayName,
      });
    });

    // Partner presence status
    socket.on('presence_status', ({ partnerOnline }) => {
      updatePartnerPresence(partnerOnline);
    });

    socket.on('partner_presence', ({ isOnline, lastActive }) => {
      updatePartnerPresence(isOnline, lastActive);
    });

    // Partner mood updates
    socket.on('partner_mood_changed', ({ displayName, mood, note, username }) => {
      if (!username || username.toLowerCase() !== user?.username?.toLowerCase()) {
        updatePartnerMood(mood, note);
      }
      queryClient.invalidateQueries({ queryKey: ['moodTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['currentMoods'] });
    });

    socket.on('mood_updated', (data) => {
      if (data?.user) {
        if (data.user.username?.toLowerCase() !== user?.username?.toLowerCase()) {
          updatePartnerMood(data.user.mood, data.moodLog?.note);
        } else {
          updateCurrentUserMood(data.user.mood);
        }
        queryClient.invalidateQueries({ queryKey: ['moodTimeline'] });
        queryClient.invalidateQueries({ queryKey: ['currentMoods'] });
      }
    });

    // Cheer Up Alert banner trigger (when partner is sad or gussa)
    socket.on('cheer_up_alert', (alertData) => {
      setCheerUpAlert(alertData);
    });

    // Reaction received (hug, kiss, sparkles, heart, fire)
    socket.on('reaction_received', (reactionData) => {
      setIncomingReaction(reactionData);
      if (reactionData?.type) {
        triggerSprinklerEffect(reactionData.type);
      }
    });

    // Partner typing note
    socket.on('partner_note_typing', ({ isTyping }) => {
      setPartnerTyping(isTyping);
    });

    // Memories cache updates
    socket.on('memory_created', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardFeed'] });
      queryClient.invalidateQueries({ queryKey: ['vaultMemories'] });
    });

    socket.on('memory_visibility_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardFeed'] });
      queryClient.invalidateQueries({ queryKey: ['vaultMemories'] });
    });

    socket.on('memory_deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardFeed'] });
      queryClient.invalidateQueries({ queryKey: ['vaultMemories'] });
    });

    socket.on('memory_liked', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardFeed'] });
    });

    // Notes cache updates
    socket.on('note_created', () => {
      queryClient.invalidateQueries({ queryKey: ['stickyNotes'] });
    });

    socket.on('note_deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['stickyNotes'] });
    });

    socket.on('note_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['stickyNotes'] });
    });

    // Real-time Chat cache & instant notification delivery
    socket.on('new_message', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      const msg = payload?.message || payload;
      if (
        msg &&
        msg.senderName &&
        user &&
        msg.senderName.toLowerCase() !== user.displayName?.toLowerCase() &&
        msg.senderName.toLowerCase() !== user.username?.toLowerCase()
      ) {
        playNotificationTone();
        triggerNativeNotification(
          `New message from ${msg.senderName} ❤️`,
          msg.text || 'Sent you something sweet 💕'
        );
        setNewChatNotification(msg);
      }
    });

    socket.on('incoming_chat_message', (data) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      if (
        data &&
        data.senderName &&
        user &&
        data.senderName.toLowerCase() !== user.displayName?.toLowerCase() &&
        data.senderName.toLowerCase() !== user.username?.toLowerCase()
      ) {
        playNotificationTone();
        triggerNativeNotification(
          `New message from ${data.senderName} ❤️`,
          data.text || 'Sent you something sweet 💕'
        );
        setNewChatNotification(data);
      }
    });

    socket.on('partner_chat_typing', ({ isTyping }) => {
      setChatPartnerTyping(isTyping);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Method to emit mood updates over socket
  const emitMoodUpdate = (mood, note = '') => {
    if (socketRef.current && user) {
      socketRef.current.emit('mood_update', {
        username: user.username,
        displayName: user.displayName,
        mood,
        note,
      });
      // Also invalidate own queries
      queryClient.invalidateQueries({ queryKey: ['moodTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['currentMoods'] });
    }
  };

  // Method to send hug or cheer up reaction
  const emitReaction = (type = 'hug', note = '') => {
    if (socketRef.current && user && partner) {
      socketRef.current.emit('send_reaction', {
        type,
        from: user.displayName,
        to: partner.displayName,
        note,
      });
    }
  };

  const emitTyping = (isTyping) => {
    if (socketRef.current && user) {
      socketRef.current.emit('note_typing', { isTyping, user: user.displayName });
    }
  };

  const emitChatTyping = (isTyping) => {
    if (socketRef.current && user) {
      socketRef.current.emit('chat_typing', { isTyping, user: user.displayName });
    }
  };

  const emitInstantMessage = (messageData) => {
    if (socketRef.current) {
      socketRef.current.emit('instant_message', messageData);
    }
  };

  const dismissCheerUpAlert = () => setCheerUpAlert(null);
  const clearIncomingReaction = () => setIncomingReaction(null);
  const clearNewChatNotification = () => setNewChatNotification(null);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        cheerUpAlert,
        incomingReaction,
        newChatNotification,
        clearNewChatNotification,
        partnerTyping,
        chatPartnerTyping,
        emitMoodUpdate,
        emitReaction,
        emitTyping,
        emitChatTyping,
        emitInstantMessage,
        dismissCheerUpAlert,
        clearIncomingReaction,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
