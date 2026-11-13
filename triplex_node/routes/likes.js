import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  reactToPost,
  removePostReaction,
  getPostReactions
} from '../controllers/likeController.js';

const router = express.Router();

// ── Post reactions ───────────────────────────────────────
router.post('/:postId/like', authenticate, reactToPost);
router.delete('/:postId/like', authenticate, removePostReaction);
router.get('/:postId/likes', getPostReactions);

export default router;
