import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, partner, updatePartnerMood, updatePartnerPresence } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  const [cheerUpAlert, setCheerUpAlert] = useState(null);
  const [incomingReaction, setIncomingReaction] = useState(null);
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
    socket.on('partner_mood_changed', ({ displayName, mood, note }) => {
      updatePartnerMood(mood, note);
      // Invalidate TanStack query cache for immediate high-speed chart & status re-render!
      queryClient.invalidateQueries({ queryKey: ['moodTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['currentMoods'] });
    });

    // Cheer Up Alert banner trigger (when partner is sad or gussa)
    socket.on('cheer_up_alert', (alertData) => {
      setCheerUpAlert(alertData);
    });

    // Reaction received (hug, kiss, heart)
    socket.on('reaction_received', (reactionData) => {
      setIncomingReaction(reactionData);
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

    // Real-time Chat cache & instant delivery
    socket.on('new_message', () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    });

    socket.on('incoming_chat_message', () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
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

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        cheerUpAlert,
        incomingReaction,
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
