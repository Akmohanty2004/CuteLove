import Note from '../models/Note.js';

// @desc    Get all sticky notes
// @route   GET /api/notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ isPinned: -1, createdAt: -1 });
    return res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return res.status(500).json({ success: false, message: 'Could not load sticky notes' });
  }
};

// @desc    Create secret sticky note
// @route   POST /api/notes
export const createNote = async (req, res) => {
  try {
    const { content, color = 'rose', isPinned = false } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Note content cannot be empty' });
    }

    const note = await Note.create({
      sender: req.user.id,
      senderName: req.user.displayName,
      content: content.trim(),
      color,
      isPinned,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('note_created', { note });
    }

    return res.status(201).json({ success: true, message: 'Secret note left!', note });
  } catch (error) {
    console.error('Create note error:', error);
    return res.status(500).json({ success: false, message: 'Could not save note' });
  }
};

// @desc    Delete sticky note
// @route   DELETE /api/notes/:id
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('note_deleted', { noteId: req.params.id });
    }

    return res.status(200).json({ success: true, message: 'Note removed' });
  } catch (error) {
    console.error('Delete note error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete note' });
  }
};

// @desc    Toggle pin sticky note
// @route   PATCH /api/notes/:id/pin
export const togglePin = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('note_updated', { note });
    }

    return res.status(200).json({ success: true, note });
  } catch (error) {
    console.error('Pin note error:', error);
    return res.status(500).json({ success: false, message: 'Could not pin note' });
  }
};
