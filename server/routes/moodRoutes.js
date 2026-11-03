import express from 'express';
import { updateMood, getCurrentMoods, getMoodTimeline } from '../controllers/moodController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyAuth); // Protect all mood routes

router.post('/update', updateMood);
router.get('/current', getCurrentMoods);
router.get('/timeline', getMoodTimeline);

export default router;
