import express from 'express';
import { getAutocompleteSuggestions, getPlaceDetails, getPlaceDetailsById } from '../controllers/map/autoCompleteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Secure autocomplete and details endpoints with authentication middleware
router.use(authenticate);

router.get('/autocomplete', getAutocompleteSuggestions);
router.get('/details/:placeId', getPlaceDetails);
router.post('/details-by-id', getPlaceDetailsById);

export default router;
