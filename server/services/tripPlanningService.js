import { searchPlaces, getHotels, getRestaurants, getAttractions } from './googlePlacesService.js';
import { generateItineraryWithGemini } from './geminiService.js';

export const planFullTrip = async ({
  destination,
  travelers = { count: 1, type: 'Solo' },
  startDate = '',
  endDate = '',
  duration = 3,
  budget = 1000,
  currency = 'USD',
  preferences = { accommodation: [], food: [], activities: [] },
  userId = null,
}) => {
  // 1. Resolve destination coords & details
  const destinationQuery = typeof destination === 'string' ? destination : destination.name || 'Goa';
  const placeResults = await searchPlaces(destinationQuery);
  const selectedPlace = placeResults[0] || {
    name: destinationQuery,
    country: 'International',
    latitude: 15.2993,
    longitude: 74.124,
    placeId: 'default_place',
  };

  const latitude = typeof destination === 'object' && destination.latitude ? destination.latitude : selectedPlace.latitude;
  const longitude = typeof destination === 'object' && destination.longitude ? destination.longitude : selectedPlace.longitude;
  const placeId = typeof destination === 'object' && destination.placeId ? destination.placeId : selectedPlace.placeId;
  const destName = typeof destination === 'object' && destination.name ? destination.name : selectedPlace.name;
  const country = typeof destination === 'object' && destination.country ? destination.country : selectedPlace.country || '';

  // 2. Fetch real places, hotels, and restaurants around this location
  const [realHotels, realRestaurants, realPlaces] = await Promise.all([
    getHotels(latitude, longitude, destName),
    getRestaurants(latitude, longitude, destName),
    getAttractions(latitude, longitude, destName),
  ]);

  // 3. Generate structured itinerary using Gemini AI with real places injected
  const aiResult = await generateItineraryWithGemini({
    destination: destName,
    travelers,
    duration,
    budget,
    currency,
    preferences,
    realPlaces,
    realHotels,
    realRestaurants,
  });

  // 4. Calculate accurate expense metrics
  const rawExpenses = aiResult.expenses || {};
  const transportation = Number(rawExpenses.transportation) || Math.round(budget * 0.22);
  const hotel = Number(rawExpenses.hotel) || Math.round(budget * 0.35);
  const food = Number(rawExpenses.food) || Math.round(budget * 0.20);
  const activities = Number(rawExpenses.activities) || Math.round(budget * 0.12);
  const localTravel = Number(rawExpenses.localTravel) || Math.round(budget * 0.06);
  const miscellaneous = Number(rawExpenses.miscellaneous) || Math.round(budget * 0.05);

  const total = transportation + hotel + food + activities + localTravel + miscellaneous;
  const count = Number(travelers.count) || 1;
  const costPerPerson = Math.round(total / count);
  const remainingBudget = Number(budget) - total;

  const expenses = {
    transportation,
    hotel,
    food,
    activities,
    localTravel,
    miscellaneous,
    total,
    costPerPerson,
    remainingBudget,
  };

  // 5. Structure full Trip Document
  const tripData = {
    userId,
    destination: destName,
    country,
    placeId,
    latitude,
    longitude,
    travelers: {
      count,
      type: travelers.type || 'Travelers',
    },
    startDate,
    endDate,
    duration: Number(duration) || 3,
    budget: Number(budget) || 1000,
    currency,
    preferences,
    itinerary: aiResult.days || [],
    hotels: realHotels,
    restaurants: realRestaurants,
    places: realPlaces,
    expenses,
    tips: aiResult.tips || [],
    isPublic: false,
  };

  return tripData;
};
