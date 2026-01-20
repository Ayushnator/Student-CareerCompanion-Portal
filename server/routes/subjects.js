import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createSubject, listSubjects, getSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';

const router = express.Router();

// Public/Basic routes (viewing)
router.get('/', listSubjects);
router.get('/:id', getSubject);

// Protected routes (Guide/Admin only)
router.use(protect);
router.post('/', authorize('guide', 'admin'), createSubject);
router.put('/:id', authorize('guide', 'admin'), updateSubject);
router.delete('/:id', authorize('guide', 'admin'), deleteSubject);

export default router;

