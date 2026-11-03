import express from 'express';
import { login, verifySession, refreshToken, logout, updateProfile } from '../controllers/authController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verifyAuth, verifySession);
router.post('/refresh', refreshToken);
router.post('/logout', verifyAuth, logout);
router.put('/profile', verifyAuth, updateProfile);

export default router;
