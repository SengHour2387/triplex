import express from 'express';
import { authenticate, optionalAuthenticate, authenticateToken } from '../middleware/auth.js';
import {
  createComment,
  getPostComments,
  deleteComment,
  getReplies,
  createReply
} from '../controllers/commentController.js';
import {
  reactToComment,
  removeCommentReaction
} from '../controllers/likeController.js';

const router = express.Router();

// ── Comments on a post ──────────────────────────────────
router.post('/:postId/comments', authenticate, createComment);
router.get('/:postId/comments', optionalAuthenticate, getPostComments);

// ── Replies ─────────────────────────────────────────────
router.get('/:commentId/replies', optionalAuthenticate, getReplies);
router.post('/:commentId/replies', authenticate, createReply);


// ── Comment reactions ────────────────────────────────────
router.post('/:commentId/like', authenticate, reactToComment);
router.delete('/:commentId/like', authenticate, removeCommentReaction);

// ── Delete comment ───────────────────────────────────────
router.delete('/comment/:commentId', authenticateToken, deleteComment);

export default router;
