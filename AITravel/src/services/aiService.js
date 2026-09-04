import api from './api.js';

export const generateTrip = async (tripRequestData) => {
  const response = await api.post('/ai/generate-trip', tripRequestData);
  return response.data;
};

export const optimizeBudget = async (budgetRequestData) => {
  const response = await api.post('/ai/optimize-budget', budgetRequestData);
  return response.data;
};

export const chat = async (chatData) => {
  const response = await api.post('/ai/chat', chatData);
  return response.data;
};
