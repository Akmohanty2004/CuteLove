import Message from '../models/Message.js';

// @desc    Get recent chat messages
// @route   GET /api/messages
export const getMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 60;
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Reverse to send chronologically
    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch messages' });
  }
};

// @desc    Send a new chat message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { text, mediaUrl = '' } = req.body;

    if (!text && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const recipientName = req.user.displayName === 'Ashis' ? 'Kirti' : 'Ashis';

    const message = await Message.create({
      sender: req.user.id,
      senderName: req.user.displayName,
      recipientName,
      text: text ? text.trim() : '',
      mediaUrl,
      isRead: false,
    });

    // Broadcast instantly to partner via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new_message', { message });
    }

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// @desc    Mark partner messages as read
// @route   PATCH /api/messages/read
export const markMessagesAsRead = async (req, res) => {
  try {
    const partnerName = req.user.displayName === 'Ashis' ? 'Kirti' : 'Ashis';

    await Message.updateMany(
      { senderName: partnerName, isRead: false },
      { isRead: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('messages_read', { readBy: req.user.displayName });
    }

    return res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ success: false, message: 'Could not mark messages as read' });
  }
};
