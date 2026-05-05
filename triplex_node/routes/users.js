import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile/:userId', getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.post('/follow/:userId', authenticateToken, followUser);
router.delete('/unfollow/:userId', authenticateToken, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

export default router;
