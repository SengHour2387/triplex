import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createPost,
  getPost,
  getUserPosts,
  getFeed,
  updatePost,
  deletePost
} from '../controllers/postController.js';

const router = express.Router();

router.post('/', authenticateToken, createPost);
router.get('/feed', authenticateToken, getFeed);
router.get('/:postId', getPost);
router.get('/user/:userId', getUserPosts);
router.put('/:postId', authenticateToken, updatePost);
router.delete('/:postId', authenticateToken, deletePost);

export default router;