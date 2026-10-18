import {
  searchPlaces,
  getHotels,
  getRestaurants,
  getAttractions,
  reverseGeocode,
} from '../services/googlePlacesService.js';
import { estimateTravelCost } from '../services/travelCostService.js';

// @desc    Search destinations / locations with autocomplete & coordinates
// @route   GET /api/places/search?q=...
// @access  Public
export const searchDestinationPlaces = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const results = await searchPlaces(query);
    res.json({ success: true, count: results.length, places: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hotels for destination
// @route   GET /api/places/hotels
// @access  Public
export const getDestinationHotels = async (req, res, next) => {
  try {
    const { lat, lng, destination } = req.query;
    const hotels = await getHotels(Number(lat), Number(lng), destination);
    res.json({ success: true, count: hotels.length, hotels });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurants for destination
// @route   GET /api/places/restaurants
// @access  Public
export const getDestinationRestaurants = async (req, res, next) => {
  try {
    const { lat, lng, destination } = req.query;
    const restaurants = await getRestaurants(Number(lat), Number(lng), destination);
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tourist attractions for destination
// @route   GET /api/places/attractions
// @access  Public
export const getDestinationAttractions = async (req, res, next) => {
  try {
    const { lat, lng, destination } = req.query;
    const attractions = await getAttractions(Number(lat), Number(lng), destination);
    res.json({ success: true, count: attractions.length, attractions });
  } catch (error) {
    next(error);
  }
};

// @desc    Reverse geocode coordinates into a readable place label
// @route   GET /api/places/reverse?lat=..&lng=..
// @access  Public
export const reverseGeocodeLocation = async (req, res, next) => {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng query parameters are required' });
    }
    const place = await reverseGeocode(latitude, longitude);
    res.json({ success: true, place });
  } catch (error) {
    next(error);
  }
};

// @desc    Estimate round-trip travel cost between origin and destination
// @route   GET /api/places/estimate-travel?fromLat=..&fromLng=..&toLat=..&toLng=..&travelers=..&currency=..
// @access  Public
export const estimateTravel = async (req, res, next) => {
  try {
    const { fromLat, fromLng, toLat, toLng, travelers, currency } = req.query;
    const estimate = estimateTravelCost({
      origin: { latitude: Number(fromLat), longitude: Number(fromLng) },
      destination: { latitude: Number(toLat), longitude: Number(toLng) },
      travelers: Number(travelers) || 1,
      currency: currency || 'INR',
    });

    if (!estimate) {
      return res.status(400).json({ success: false, message: 'Valid origin and destination coordinates are required' });
    }

    res.json({ success: true, estimate });
  } catch (error) {
    next(error);
  }
};
