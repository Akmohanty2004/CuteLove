import express from 'express';
import { getMessages, sendMessage, markMessagesAsRead } from '../controllers/messageController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyAuth); // Protect all chat routes

router.get('/', getMessages);
router.post('/', sendMessage);
router.patch('/read', markMessagesAsRead);

export default router;
