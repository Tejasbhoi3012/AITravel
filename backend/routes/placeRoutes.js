import express from 'express';
import {
  searchDestinationPlaces,
  getDestinationHotels,
  getDestinationRestaurants,
  getDestinationAttractions,
  reverseGeocodeLocation,
  estimateTravel,
} from '../controllers/placeController.js';

const router = express.Router();

router.get('/search', searchDestinationPlaces);
router.get('/hotels', getDestinationHotels);
router.get('/restaurants', getDestinationRestaurants);
router.get('/attractions', getDestinationAttractions);
router.get('/reverse', reverseGeocodeLocation);
router.get('/estimate-travel', estimateTravel);

export default router;
