import express from 'express';
import multer from 'multer';
import { updateProfilePicture } from '../controllers/profile/profilePictureController.js';
import { getProfile } from '../controllers/profile/profileController.js';
import { authenticate } from '../middleware/auth.js';
import { checkUsernameAvailability } from '../controllers/profile/usernameAvailability.js';
import { changeUsernameController, changeEmailController } from '../controllers/profile/changeUserInfoController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Apply authentication middleware to all profile routes
router.post('/check-username', checkUsernameAvailability);
router.use(authenticate);
router.get('/me', getProfile);
router.post('/profile-picture', upload.single('image'), updateProfilePicture);
router.put("/change-username",changeUsernameController);
router.put("/change-email",changeEmailController);

export default router;
