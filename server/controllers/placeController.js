import {
  searchPlaces,
  getHotels,
  getRestaurants,
  getAttractions,
} from '../services/googlePlacesService.js';

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
