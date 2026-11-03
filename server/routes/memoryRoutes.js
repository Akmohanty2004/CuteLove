import express from 'express';
import {
  uploadMemory,
  getDashboardFeed,
  getVaultMemories,
  toggleVisibility,
  deleteMemory,
  likeMemory,
  getMemoriesOfTheDay,
} from '../controllers/memoryController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(verifyAuth); // Protect all memory routes

router.post('/upload', upload.single('media'), uploadMemory);
router.get('/feed', getDashboardFeed);
router.get('/vault', getVaultMemories);
router.get('/flashback', getMemoriesOfTheDay);
router.patch('/:id/toggle-visibility', toggleVisibility);
router.delete('/:id', deleteMemory);
router.post('/:id/like', likeMemory);

export default router;
