import express from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile/:userId', optionalAuthenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.post('/follow/:userId', authenticate, followUser);
router.delete('/unfollow/:userId', authenticate, unfollowUser);
router.get('/:userId/followers', optionalAuthenticate, getFollowers);
router.get('/:userId/following', optionalAuthenticate, getFollowing);

export default router;

