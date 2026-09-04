import express from 'express';
import {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  shareTrip,
  getSharedTripByToken,
} from '../controllers/tripController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(optionalAuth, createTrip)
  .get(protect, getUserTrips);

router.get('/share/:token', getSharedTripByToken);
router.post('/:id/duplicate', protect, duplicateTrip);
router.post('/:id/share', optionalAuth, shareTrip);

router.route('/:id')
  .get(optionalAuth, getTripById)
  .put(optionalAuth, updateTrip)
  .delete(protect, deleteTrip);

export default router;
