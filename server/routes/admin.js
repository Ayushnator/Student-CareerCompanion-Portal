import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getPendingRequests,
  approveRequest,
  rejectRequest,
} from '../controllers/adminController.js';

const router = express.Router();

// Debug middleware for Admin Router
router.use((req, res, next) => {
  console.log(`[Admin Router] ${req.method} ${req.url}`);
  next();
});

// Protect all routes: Must be logged in AND be an Admin
router.use(protect);
router.use(authorize('admin'));

router.get('/requests', getPendingRequests);
router.post('/approve/:userId', approveRequest);
router.post('/reject/:userId', rejectRequest);

// Debug: Log if request reaches admin router but doesn't match
router.use('*', (req, res) => {
  console.log(`[Admin Router] Unhandled path: ${req.originalUrl}`);
  res.status(404).json({ status: 'error', message: 'Admin route not found' });
});

export default router;
