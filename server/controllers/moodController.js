import User from '../models/User.js';
import MoodLog from '../models/MoodLog.js';

// Numeric mapping for Recharts visualization
export const MOOD_LEVELS = {
  happy: 4,
  normal: 3,
  sad: 2,
  gussa: 1,
};

// @desc    Update current mood & log history
// @route   POST /api/moods/update
export const updateMood = async (req, res) => {
  try {
    const { mood, note = '' } = req.body;
    const validMoods = ['happy', 'normal', 'sad', 'gussa'];

    if (!validMoods.includes(mood)) {
      return res.status(400).json({ success: false, message: 'Invalid mood value' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.currentMood = mood;
    user.lastMoodUpdate = new Date();
    await user.save();

    // Create log in MoodLog
    const moodLog = await MoodLog.create({
      user: user._id,
      username: user.username,
      mood,
      note: note.trim(),
      createdAt: new Date(),
    });

    // Notify partner via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // 1. Direct partner mood changed broadcast to all connected couple clients
      io.emit('partner_mood_changed', {
        username: user.username,
        displayName: user.displayName,
        mood,
        note: note.trim(),
        timestamp: user.lastMoodUpdate,
      });

      // 2. Full payload broadcast
      io.emit('mood_updated', {
        user: {
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          mood,
          lastMoodUpdate: user.lastMoodUpdate,
        },
        moodLog,
      });

      // 3. Cheer Up Alert banner trigger if sad or gussa
      if (mood === 'sad' || mood === 'gussa') {
        const partnerName = user.username.toLowerCase() === 'ashis' ? 'Kirti' : 'Ashis';
        const partnerUser = user.username.toLowerCase() === 'ashis' ? 'kirti' : 'ashis';
        const bannerMessage = mood === 'sad'
          ? `Hello ${partnerName}, ${user.displayName} is feeling sad. Go send some warm love and cheer ${user.displayName === 'Ashis' ? 'him' : 'her'} up! 🥺❤️`
          : `Hello ${partnerName}, ${user.displayName} is feeling gussa! Go melt ${user.displayName === 'Ashis' ? 'his' : 'her'} heart with extra cuddles! 😤💕`;

        io.emit('cheer_up_alert', {
          fromUser: user.username,
          fromDisplayName: user.displayName,
          targetUser: partnerUser,
          targetDisplayName: partnerName,
          mood,
          message: bannerMessage,
          timestamp: new Date(),
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Mood updated to ${mood}`,
      currentMood: mood,
      moodLog,
    });
  } catch (error) {
    console.error('Update mood error:', error);
    return res.status(500).json({ success: false, message: 'Could not update mood' });
  }
};

// @desc    Get current couple mood status
// @route   GET /api/moods/current
export const getCurrentMoods = async (req, res) => {
  try {
    const ashis = await User.findOne({ username: 'ashis' }).select('displayName currentMood lastMoodUpdate avatar customStatus');
    const kirti = await User.findOne({ username: 'kirti' }).select('displayName currentMood lastMoodUpdate avatar customStatus');

    return res.status(200).json({
      success: true,
      ashis: ashis || null,
      kirti: kirti || null,
    });
  } catch (error) {
    console.error('Get moods error:', error);
    return res.status(500).json({ success: false, message: 'Could not retrieve moods' });
  }
};

// @desc    Get mood timeline for last 24 hours (or past week) for Recharts
// @route   GET /api/moods/timeline
export const getMoodTimeline = async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await MoodLog.find({ createdAt: { $gte: sinceDate } })
      .sort({ createdAt: 1 })
      .lean();

    // Map logs for Recharts
    const chartData = logs.map((log) => {
      const timeStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        id: log._id,
        time: timeStr,
        timestamp: log.createdAt,
        username: log.username,
        mood: log.mood,
        score: MOOD_LEVELS[log.mood] || 3,
        ashisScore: log.username === 'ashis' ? MOOD_LEVELS[log.mood] : undefined,
        kirtiScore: log.username === 'kirti' ? MOOD_LEVELS[log.mood] : undefined,
        note: log.note || '',
      };
    });

    return res.status(200).json({
      success: true,
      chartData,
      totalEntries: logs.length,
    });
  } catch (error) {
    console.error('Mood timeline error:', error);
    return res.status(500).json({ success: false, message: 'Could not load mood timeline' });
  }
};
