import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createComment,
  getPostComments,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

router.post('/:postId/comments', authenticateToken, createComment);
router.get('/:postId/comments', getPostComments);
router.delete('/comment/:commentId', authenticateToken, deleteComment);

export default router;
