import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createResource, listResources, getResource, updateResource, deleteResource } from '../controllers/resourceController.js';

const router = express.Router();

// Public/Basic routes (viewing)
router.get('/', listResources);
router.get('/:id', getResource);

// Protected routes (Guide/Admin only)
router.use(protect);
router.post('/', authorize('guide', 'admin'), createResource);
router.put('/:id', authorize('guide', 'admin'), updateResource);
router.delete('/:id', authorize('guide', 'admin'), deleteResource);

export default router;

