import api from './api.js';

export const getTrips = async () => {
  const response = await api.get('/trips');
  return response.data;
};

export const getTrip = async (id) => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};

export const createTrip = async (tripData) => {
  const response = await api.post('/trips', tripData);
  return response.data;
};

export const updateTrip = async (id, tripData) => {
  const response = await api.put(`/trips/${id}`, tripData);
  return response.data;
};

export const deleteTrip = async (id) => {
  const response = await api.delete(`/trips/${id}`);
  return response.data;
};

export const duplicateTrip = async (id) => {
  const response = await api.post(`/trips/${id}/duplicate`);
  return response.data;
};

export const shareTrip = async (id) => {
  const response = await api.post(`/trips/${id}/share`);
  return response.data;
};

export const getSharedTrip = async (token) => {
  const response = await api.get(`/trips/share/${token}`);
  return response.data;
};
