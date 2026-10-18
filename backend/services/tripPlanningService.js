import { searchPlaces, getNearbyPois } from './googlePlacesService.js';
import { generateItineraryWithGemini } from './geminiService.js';
import { estimateTravelCost } from './travelCostService.js';

export const planFullTrip = async ({
  destination,
  destinationDetails = null,
  origin = null,
  travelers = { count: 1, type: 'Solo' },
  startDate = '',
  endDate = '',
  duration = 3,
  budget = 1000,
  currency = 'USD',
  preferences = { accommodation: [], food: [], activities: [] },
  userId = null,
}) => {
  // 1. Resolve destination coords & details (prefer the user-selected place)
  const destinationQuery = typeof destination === 'string' ? destination : destination.name || 'Destination';
  const destDetails = destinationDetails || (typeof destination === 'object' ? destination : null);
  const hasDetails =
    destDetails &&
    Number.isFinite(Number(destDetails.latitude)) &&
    Number.isFinite(Number(destDetails.longitude));

  let selectedPlace = null;
  if (!hasDetails) {
    const placeResults = await searchPlaces(destinationQuery);
    selectedPlace = placeResults[0] || null;
  }

  // Only treat coords as usable when they are real (non-zero); never silently
  // substitute unrelated default coordinates — POIs must belong to the search.
  const rawLat = hasDetails ? Number(destDetails.latitude) : Number(selectedPlace?.latitude);
  const rawLng = hasDetails ? Number(destDetails.longitude) : Number(selectedPlace?.longitude);
  const hasCoords = Number.isFinite(rawLat) && Number.isFinite(rawLng) && (rawLat !== 0 || rawLng !== 0);
  const latitude = hasCoords ? rawLat : 0;
  const longitude = hasCoords ? rawLng : 0;
  const placeId = (destDetails && destDetails.placeId) || selectedPlace?.placeId || '';
  const destName =
    (typeof destination === 'object' && destination?.name) ||
    destDetails?.name ||
    selectedPlace?.name ||
    destinationQuery;
  const country = destDetails?.country || selectedPlace?.country || '';

  // 2. Fetch real hotels, restaurants, and attractions in one pass — only
  // when the destination was geocoded, so sections never show unrelated data.
  const pois = hasCoords
    ? await getNearbyPois(latitude, longitude, destName)
    : { hotels: [], restaurants: [], places: [] };
  const { hotels: realHotels, restaurants: realRestaurants, places: realPlaces } = pois;

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

  // 4. Calculate accurate expense metrics (distance-based transit when origin is known)
  const count = Number(travelers.count) || 1;
  const travelEstimate = estimateTravelCost({
    origin,
    destination: { latitude, longitude },
    travelers: count,
    currency,
  });

  const rawExpenses = aiResult.expenses || {};
  const transportation = travelEstimate
    ? travelEstimate.total
    : Number(rawExpenses.transportation) || Math.round(budget * 0.22);
  const hotel = Number(rawExpenses.hotel) || Math.round(budget * 0.35);
  const food = Number(rawExpenses.food) || Math.round(budget * 0.20);
  const activities = Number(rawExpenses.activities) || Math.round(budget * 0.12);
  const localTravel = Number(rawExpenses.localTravel) || Math.round(budget * 0.06);
  const miscellaneous = Number(rawExpenses.miscellaneous) || Math.round(budget * 0.05);

  const total = transportation + hotel + food + activities + localTravel + miscellaneous;
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
    origin: travelEstimate
      ? {
          name: origin?.name || 'Current Location',
          latitude: Number(origin.latitude),
          longitude: Number(origin.longitude),
        }
      : undefined,
    distanceKm: travelEstimate ? travelEstimate.distanceKm : 0,
    transportMode: travelEstimate ? travelEstimate.mode : '',
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
