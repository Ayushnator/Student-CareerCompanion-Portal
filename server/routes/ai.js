import express from 'express';
import { sendMessage, getHistory, clearHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All AI routes require authentication

router.post('/chat', sendMessage);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export default router;
