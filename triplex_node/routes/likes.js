import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  likePost,
  unlikePost,
  getPostLikes
} from '../controllers/likeController.js';

const router = express.Router();

router.post('/:postId/like', authenticateToken, likePost);
router.delete('/:postId/like', authenticateToken, unlikePost);
router.get('/:postId/likes', getPostLikes);

export default router;
