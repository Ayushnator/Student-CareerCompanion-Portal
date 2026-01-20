import express from 'express';
import { createPost, listPosts, getPost, updatePost, deletePost, addComment, listComments, deleteComment } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listPosts);
router.get('/:id', getPost);
router.get('/:id/comments', listComments);

router.use(protect);

router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

router.post('/:id/comments', addComment);
router.delete('/comments/:commentId', deleteComment);

export default router;

