import express from 'express';
import {login,loginUsername} from '../controllers/auth/logInController.js';
import { register } from '../controllers/auth/registerController.js';
import { refreshToken } from '../controllers/auth/refreshController.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login-username', loginUsername);
router.post('/refresh', refreshToken);
export default router;