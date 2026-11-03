export const initSocket = (io) => {
  const onlineUsers = new Map(); // username -> socketId

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their identity
    socket.on('join_couple_space', ({ username, displayName }) => {
      if (!username) return;
      const cleanUser = username.toLowerCase();
      onlineUsers.set(cleanUser, socket.id);
      socket.join('couple_space');
      socket.username = cleanUser;
      socket.displayName = displayName;

      console.log(`💕 ${displayName} (${cleanUser}) entered couple space`);

      // Notify the other partner that this user is online
      const partnerUser = cleanUser === 'ashis' ? 'kirti' : 'ashis';
      const isPartnerOnline = onlineUsers.has(partnerUser);

      // Tell the connected user the partner's status
      socket.emit('presence_status', {
        partnerOnline: isPartnerOnline,
        onlineUsers: Array.from(onlineUsers.keys()),
      });

      // Broadcast to room that this partner is active
      socket.to('couple_space').emit('partner_presence', {
        username: cleanUser,
        displayName,
        isOnline: true,
        lastActive: new Date(),
      });
    });

    // Real-time mood update broadcast
    socket.on('mood_update', (data) => {
      const { mood, note, username, displayName } = data;
      console.log(`Mood sync: ${displayName} is now ${mood}`);

      // Broadcast to partner across both room and broadcast channels
      socket.broadcast.emit('partner_mood_changed', {
        username,
        displayName,
        mood,
        note,
        timestamp: new Date(),
      });
      socket.to('couple_space').emit('partner_mood_changed', {
        username,
        displayName,
        mood,
        note,
        timestamp: new Date(),
      });

      // Special Cheer-Up Banner Alert trigger
      if (mood === 'sad' || mood === 'gussa') {
        const partnerName = username.toLowerCase() === 'ashis' ? 'Kirti' : 'Ashis';
        const partnerUser = username.toLowerCase() === 'ashis' ? 'kirti' : 'ashis';
        const bannerMessage = mood === 'sad'
          ? `Hello ${partnerName}, ${displayName} is feeling sad. Go send some warm love and cheer ${displayName === 'Ashis' ? 'him' : 'her'} up! 🥺❤️`
          : `Hello ${partnerName}, ${displayName} is feeling gussa! Go melt ${displayName === 'Ashis' ? 'his' : 'her'} heart with extra cuddles! 😤💕`;

        socket.to('couple_space').emit('cheer_up_alert', {
          fromUser: username,
          fromDisplayName: displayName,
          targetUser: partnerUser,
          targetDisplayName: partnerName,
          mood,
          message: bannerMessage,
          timestamp: new Date(),
        });
      }
    });

    // Send hug / cheer up reaction
    socket.on('send_reaction', ({ type = 'hug', from, to, note = '' }) => {
      console.log(`Reaction sent: ${from} sent ${type} to ${to}`);
      socket.to('couple_space').emit('reaction_received', {
        type, // 'hug', 'kiss', 'sparkle', 'heart'
        from,
        to,
        note,
        timestamp: new Date(),
      });
    });

    // Sticky note typing indicator
    socket.on('note_typing', ({ isTyping, user }) => {
      socket.to('couple_space').emit('partner_note_typing', { isTyping, user });
    });

    // High-speed real-time couple chat
    socket.on('chat_typing', ({ isTyping, user }) => {
      socket.to('couple_space').emit('partner_chat_typing', { isTyping, user });
    });

    socket.on('instant_message', (data) => {
      // Instant broadcast to partner for zero-latency real-time chat
      socket.to('couple_space').emit('incoming_chat_message', data);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      if (socket.username) {
        onlineUsers.delete(socket.username);
        console.log(`👋 ${socket.displayName || socket.username} disconnected`);
        socket.to('couple_space').emit('partner_presence', {
          username: socket.username,
          displayName: socket.displayName,
          isOnline: false,
          lastActive: new Date(),
        });
      }
    });
  });
};
