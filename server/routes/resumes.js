import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  analyzeResume
} from '../controllers/resumeController.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
  .get(getResumes)
  .post(createResume);

router.post('/:id/analyze', analyzeResume);

router.route('/:id')
  .get(getResume)
  .put(updateResume)
  .delete(deleteResume);

export default router;
