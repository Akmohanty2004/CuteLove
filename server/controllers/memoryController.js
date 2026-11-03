import Memory from '../models/Memory.js';
import { uploadMediaBuffer, deleteMedia } from '../config/cloudinary.js';

// @desc    Upload image or video memory
// @route   POST /api/memories/upload
export const uploadMemory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image or video to upload.' });
    }

    const { caption = '', isVisibleOnDashboard = 'false', date } = req.body;
    const isVisible = isVisibleOnDashboard === 'true' || isVisibleOnDashboard === true;

    // Upload to Cloudinary (or local fallback)
    const uploadResult = await uploadMediaBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'ashis_kirti_memories'
    );

    const memory = await Memory.create({
      uploader: req.user.id,
      uploaderName: req.user.displayName,
      mediaType: uploadResult.resourceType === 'video' ? 'video' : 'image',
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      caption: caption.trim(),
      isVisibleOnDashboard: isVisible,
      date: date ? new Date(date) : new Date(),
    });

    // Broadcast memory update via Socket.io if available on req.app
    const io = req.app.get('io');
    if (io) {
      io.emit('memory_created', {
        memory,
        author: req.user.displayName,
        isVisibleOnDashboard: isVisible,
      });
    }

    return res.status(201).json({
      success: true,
      message: isVisible ? 'Memory shared to dashboard!' : 'Memory saved privately in vault!',
      memory,
    });
  } catch (error) {
    console.error('Upload memory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload memory: ' + error.message });
  }
};

// @desc    Get dashboard feed (only visible memories)
// @route   GET /api/memories/feed
export const getDashboardFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const memories = await Memory.find({ isVisibleOnDashboard: true })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Memory.countDocuments({ isVisibleOnDashboard: true });

    return res.status(200).json({
      success: true,
      memories,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard feed' });
  }
};

// @desc    Get all memories in Vault (private + visible)
// @route   GET /api/memories/vault
export const getVaultMemories = async (req, res) => {
  try {
    const { mediaType, uploader, search } = req.query;
    const query = {};

    if (mediaType && mediaType !== 'all') {
      query.mediaType = mediaType;
    }
    if (uploader && uploader !== 'all') {
      query.uploaderName = new RegExp(`^${uploader}$`, 'i');
    }
    if (search) {
      query.caption = { $regex: search, $options: 'i' };
    }

    const memories = await Memory.find(query).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      memories,
      count: memories.length,
    });
  } catch (error) {
    console.error('Get vault error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load vault memories' });
  }
};

// @desc    Toggle whether a memory is visible on shared dashboard
// @route   PATCH /api/memories/:id/toggle-visibility
export const toggleVisibility = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }

    memory.isVisibleOnDashboard = !memory.isVisibleOnDashboard;
    await memory.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('memory_visibility_changed', {
        memoryId: memory._id,
        isVisibleOnDashboard: memory.isVisibleOnDashboard,
        caption: memory.caption,
      });
    }

    return res.status(200).json({
      success: true,
      message: memory.isVisibleOnDashboard ? 'Memory is now visible on Dashboard feed' : 'Memory moved to private vault only',
      memory,
    });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle visibility' });
  }
};

// @desc    Delete a memory
// @route   DELETE /api/memories/:id
export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }

    // Delete media from Cloudinary or local storage
    if (memory.publicId) {
      await deleteMedia(memory.publicId, memory.mediaType);
    }

    await Memory.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('memory_deleted', { memoryId: req.params.id });
    }

    return res.status(200).json({
      success: true,
      message: 'Memory deleted successfully',
      memoryId: req.params.id,
    });
  } catch (error) {
    console.error('Delete memory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete memory' });
  }
};

// @desc    Love / Like reaction on memory
// @route   POST /api/memories/:id/like
export const likeMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }

    const userName = req.user.displayName;
    const existingIndex = memory.likes.findIndex((l) => l.user === userName);

    if (existingIndex > -1) {
      memory.likes.splice(existingIndex, 1);
    } else {
      memory.likes.push({ user: userName, timestamp: new Date() });
    }

    await memory.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('memory_liked', {
        memoryId: memory._id,
        likes: memory.likes,
        user: userName,
      });
    }

    return res.status(200).json({
      success: true,
      likes: memory.likes,
      liked: existingIndex === -1,
    });
  } catch (error) {
    console.error('Like memory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to like memory' });
  }
};

// @desc    Memories of the Day flashback collage (4 random images)
// @route   GET /api/memories/flashback
export const getMemoriesOfTheDay = async (req, res) => {
  try {
    const images = await Memory.aggregate([
      { $match: { mediaType: 'image' } },
      { $sample: { size: 4 } },
    ]);

    return res.status(200).json({
      success: true,
      flashbacks: images,
    });
  } catch (error) {
    console.error('Flashback error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch flashback memories' });
  }
};
