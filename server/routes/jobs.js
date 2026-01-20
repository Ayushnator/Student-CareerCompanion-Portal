import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getJobs, createJob, recommendJobs } from '../controllers/jobController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getJobs)
  .post(authorize('guide', 'admin'), createJob);

router.post('/recommend', recommendJobs);

export default router;
