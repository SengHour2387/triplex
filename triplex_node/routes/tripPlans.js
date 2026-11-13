import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createTripPlan,
  getTripPlans,
  getTripPlanById,
  deleteTripPlan
} from '../controllers/tripPlanController.js';

const router = express.Router();

// All trip plan endpoints require authentication
router.use(authenticate);

router.post('/', createTripPlan);
router.get('/', getTripPlans);
router.get('/:id', getTripPlanById);
router.delete('/:id', deleteTripPlan);

export default router;
