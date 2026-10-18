import api from './api.js';

export const searchPlaces = async (query) => {
  const response = await api.get('/places/search', {
    params: { q: query },
  });
  return response.data;
};

export const reverseGeocode = async (latitude, longitude) => {
  const response = await api.get('/places/reverse', {
    params: { lat: latitude, lng: longitude },
  });
  return response.data;
};

export const estimateTravel = async ({ fromLat, fromLng, toLat, toLng, travelers, currency }) => {
  const response = await api.get('/places/estimate-travel', {
    params: { fromLat, fromLng, toLat, toLng, travelers, currency },
  });
  return response.data;
};
