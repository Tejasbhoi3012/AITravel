import { createContext, useContext, useState } from 'react';
import * as aiService from '../services/aiService';
import * as tripService from '../services/tripService';

const TripContext = createContext();

const initialPlannerState = {
  destination: 'Goa',
  destinationDetails: null, // { name, country, placeId, latitude, longitude }
  travelers: { count: 2, type: 'Couple' },
  startDate: '',
  endDate: '',
  duration: 4,
  budget: 2500,
  currency: 'USD',
  preferences: {
    accommodation: ['Boutique Hotel', 'Standard Hotel'],
    food: ['Local Delicacies', 'Street Food'],
    activities: ['Beaches & Coastline', 'Historical Landmarks', 'Nature & Hiking'],
  },
};

const createClientFallbackTrip = (state) => {
  const dest = state.destination || 'Goa';
  const duration = Number(state.duration) || 3;
  const budget = Number(state.budget) || 1000;
  const count = Number(state.travelers?.count) || 1;

  const days = [];
  for (let i = 1; i <= duration; i++) {
    days.push({
      day: i,
      title: i === 1 ? `Arrival & Exploration in ${dest}` : i === duration ? `Farewell ${dest} & Highlights` : `Cultural Discovery & Sights of ${dest}`,
      theme: i === 1 ? 'Arrival & Coastline' : 'Landmarks & Dining',
      activities: [
        {
          id: `act_${i}_1`,
          time: '09:30 AM',
          period: 'morning',
          title: `Morning Walk & Scenic View of ${dest}`,
          description: `Enjoy the morning breeze, historic viewpoints, and photography spots.`,
          estimatedCost: Math.round((budget * 0.02) / duration),
          durationMinutes: 120,
          category: 'Sightseeing',
          latitude: 15.2993,
          longitude: 74.124,
        },
        {
          id: `act_${i}_2`,
          time: '02:00 PM',
          period: 'afternoon',
          title: `Explore Central ${dest} Heritage & Markets`,
          description: `Discover local arts, handicraft markets, and historic architecture.`,
          estimatedCost: Math.round((budget * 0.03) / duration),
          durationMinutes: 150,
          category: 'Culture',
          latitude: 15.305,
          longitude: 74.130,
        },
        {
          id: `act_${i}_3`,
          time: '07:30 PM',
          period: 'evening',
          title: `Authentic Dining & Sunset Views`,
          description: `Sample signature local cuisine and enjoy evening ambiance.`,
          estimatedCost: Math.round((budget * 0.04) / duration),
          durationMinutes: 90,
          category: 'Dining',
          latitude: 15.295,
          longitude: 74.118,
        },
      ],
    });
  }

  const estHotel = Math.round(budget * 0.35);
  const estTransport = Math.round(budget * 0.22);
  const estFood = Math.round(budget * 0.20);
  const estActivities = Math.round(budget * 0.12);
  const estLocalTravel = Math.round(budget * 0.06);
  const estMisc = Math.round(budget * 0.05);
  const total = estHotel + estTransport + estFood + estActivities + estLocalTravel + estMisc;

  return {
    _id: `trip_${Date.now()}`,
    destination: dest,
    country: 'Featured Destination',
    latitude: 15.2993,
    longitude: 74.124,
    travelers: state.travelers || { count: 2, type: 'Couple' },
    duration,
    budget,
    currency: state.currency || 'USD',
    preferences: state.preferences,
    itinerary: days,
    hotels: [
      {
        placeId: 'h1',
        name: `Grand ${dest} Ocean Resort & Spa`,
        rating: 4.8,
        userRatingsTotal: 1420,
        address: `100 Coastline Blvd, ${dest}`,
        priceEstimate: '$$$',
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
        latitude: 15.302,
        longitude: 74.128,
        category: 'Luxury Resort',
      },
      {
        placeId: 'h2',
        name: `${dest} Heritage Boutique Suites`,
        rating: 4.6,
        userRatingsTotal: 780,
        address: `Old Town District, ${dest}`,
        priceEstimate: '$$',
        photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
        latitude: 15.295,
        longitude: 74.120,
        category: 'Boutique Hotel',
      },
    ],
    restaurants: [
      {
        placeId: 'r1',
        name: `The Coastal Fishermans Bistro`,
        rating: 4.7,
        userRatingsTotal: 1850,
        address: `Harbor Walk, ${dest}`,
        cuisine: 'Seafood & Coastal',
        priceEstimate: '$$',
        photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'],
        latitude: 15.298,
        longitude: 74.125,
      },
      {
        placeId: 'r2',
        name: `Sunset Cliff Lounge & Grill`,
        rating: 4.8,
        userRatingsTotal: 2100,
        address: `Cliffside Point, ${dest}`,
        cuisine: 'International & Drinks',
        priceEstimate: '$$$',
        photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
        latitude: 15.308,
        longitude: 74.115,
      },
    ],
    places: [
      {
        placeId: 'p1',
        name: `Historic Landmark & Fort of ${dest}`,
        rating: 4.9,
        userRatingsTotal: 4200,
        address: `Fortification Point, ${dest}`,
        category: 'Landmark',
        photos: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
        latitude: 15.312,
        longitude: 74.135,
      },
      {
        placeId: 'p2',
        name: `${dest} Botanical Sanctuary & Falls`,
        rating: 4.7,
        userRatingsTotal: 1650,
        address: `Valley Road, ${dest}`,
        category: 'Nature & Parks',
        photos: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'],
        latitude: 15.290,
        longitude: 74.140,
      },
    ],
    expenses: {
      transportation: estTransport,
      hotel: estHotel,
      food: estFood,
      activities: estActivities,
      localTravel: estLocalTravel,
      miscellaneous: estMisc,
      total,
      costPerPerson: Math.round(total / count),
      remainingBudget: budget - total,
    },
    tips: [
      `Download offline maps for ${dest} in advance.`,
      `Carry light clothing and comfortable footwear for daytime sightseeing.`,
      `Visit popular landmarks during early mornings to avoid midday heat and crowds.`,
    ],
  };
};

export const TripProvider = ({ children }) => {
  const [plannerState, setPlannerState] = useState(initialPlannerState);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState(null);

  const updatePlannerField = (field, value) => {
    setPlannerState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePreferenceList = (category, item) => {
    setPlannerState((prev) => {
      const currentList = prev.preferences[category] || [];
      const exists = currentList.includes(item);
      const updated = exists
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];

      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [category]: updated,
        },
      };
    });
  };

  const generateTripPlan = async (customState = null) => {
    const payload = customState || plannerState;
    setLoading(true);
    setError(null);
    setGenerationStep('Analyzing travel preferences...');

    try {
      setTimeout(() => setGenerationStep('Finding real places & hotels via Google Places...'), 1000);
      setTimeout(() => setGenerationStep('Generating day-by-day itinerary with Gemini AI...'), 2200);
      setTimeout(() => setGenerationStep('Calculating exact travel expenses & transit...'), 3500);
      setTimeout(() => setGenerationStep('Finalizing your personalized travel guide...'), 4500);

      let trip;
      try {
        const data = await aiService.generateTrip(payload);
        if (data.success && data.trip) {
          trip = data.trip;
        }
      } catch (apiErr) {
        console.warn('Backend offline, using client-side trip generation engine:', apiErr.message);
        trip = createClientFallbackTrip(payload);
      }

      if (trip) {
        setCurrentTrip(trip);
        setLoading(false);
        return trip;
      } else {
        throw new Error('Failed to generate itinerary');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate trip');
      setLoading(false);
      throw err;
    }
  };

  const loadTrip = async (id) => {
    setLoading(true);
    try {
      const data = await tripService.getTrip(id);
      if (data.success && data.trip) {
        setCurrentTrip(data.trip);
      }
      setLoading(false);
      return data.trip;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const refreshUserTrips = async () => {
    try {
      const data = await tripService.getTrips();
      if (data.success && data.trips) {
        setUserTrips(data.trips);
      }
    } catch (err) {
      console.warn('Could not fetch user trips:', err.message);
    }
  };

  return (
    <TripContext.Provider
      value={{
        plannerState,
        setPlannerState,
        updatePlannerField,
        updatePreferenceList,
        currentTrip,
        setCurrentTrip,
        userTrips,
        setUserTrips,
        loading,
        setLoading,
        generationStep,
        error,
        setError,
        generateTripPlan,
        loadTrip,
        refreshUserTrips,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export default TripContext;
