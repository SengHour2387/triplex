import express from 'express';
import multer from 'multer';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import {
  createPost,
  repostPost,
  getPost,
  getUserPosts,
  getFeed,
  updatePost,
  deletePost
} from '../controllers/postController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', authenticate, upload.array('media', 10), createPost);
router.post('/:postId/repost', authenticate, repostPost);
router.get('/feed', optionalAuthenticate, getFeed);
router.get('/:postId', optionalAuthenticate, getPost);
router.get('/user/:userId', optionalAuthenticate, getUserPosts);
router.put('/:postId', authenticate, updatePost);
router.delete('/:postId', authenticate, deletePost);

export default router;