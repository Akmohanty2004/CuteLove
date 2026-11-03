import express from 'express';
import { getNotes, createNote, deleteNote, togglePin } from '../controllers/noteController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyAuth); // Protect all notes routes

router.get('/', getNotes);
router.post('/', createNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', togglePin);

export default router;
