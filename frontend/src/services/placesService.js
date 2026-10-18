import api from './api.js';

export const searchPlaces = async (query) => {
  const response = await api.get('/places/search', {
    params: { q: query },
  });
  return response.data;
};

export const getHotels = async (lat, lng, destination) => {
  const response = await api.get('/places/hotels', {
    params: { lat, lng, destination },
  });
  return response.data;
};

export const getRestaurants = async (lat, lng, destination) => {
  const response = await api.get('/places/restaurants', {
    params: { lat, lng, destination },
  });
  return response.data;
};

export const getAttractions = async (lat, lng, destination) => {
  const response = await api.get('/places/attractions', {
    params: { lat, lng, destination },
  });
  return response.data;
};
