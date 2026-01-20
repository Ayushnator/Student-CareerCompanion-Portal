import express from 'express';
import { register, login, getMe, logout, requestGuideRole } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/request-guide', protect, requestGuideRole);

export default router;
