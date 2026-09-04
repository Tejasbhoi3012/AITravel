import express from 'express';
import {
  searchDestinationPlaces,
  getDestinationHotels,
  getDestinationRestaurants,
  getDestinationAttractions,
} from '../controllers/placeController.js';

const router = express.Router();

router.get('/search', searchDestinationPlaces);
router.get('/hotels', getDestinationHotels);
router.get('/restaurants', getDestinationRestaurants);
router.get('/attractions', getDestinationAttractions);

export default router;
