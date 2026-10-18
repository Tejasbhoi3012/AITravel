import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  id: { type: String },
  time: { type: String, default: '10:00 AM' },
  period: { type: String, enum: ['morning', 'afternoon', 'evening'], default: 'morning' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  placeId: { type: String, default: '' },
  locationName: { type: String, default: '' },
  latitude: { type: Number },
  longitude: { type: Number },
  estimatedCost: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 120 },
  category: { type: String, default: 'sightseeing' },
});

const dayItinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String },
  title: { type: String, default: 'Exploration & Sightseeing' },
  theme: { type: String, default: '' },
  activities: [activitySchema],
});

const placeItemSchema = new mongoose.Schema({
  placeId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  userRatingsTotal: { type: Number, default: 0 },
  address: { type: String, default: '' },
  vicinity: { type: String, default: '' },
  latitude: { type: Number },
  longitude: { type: Number },
  photos: [{ type: String }],
  priceLevel: { type: Number },
  priceEstimate: { type: String, default: 'Price unavailable' },
  category: { type: String, default: '' },
  cuisine: { type: String, default: '' },
  openNow: { type: Boolean },
  types: [{ type: String }],
});

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allows guest/unauthenticated trip generation initially
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    country: {
      type: String,
      default: '',
    },
    placeId: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      required: true,
      default: 0,
    },
    longitude: {
      type: Number,
      required: true,
      default: 0,
    },
    origin: {
      name: { type: String, default: '' },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    distanceKm: {
      type: Number,
      default: 0,
    },
    transportMode: {
      type: String,
      default: '',
    },
    travelers: {
      count: { type: Number, default: 1 },
      type: { type: String, default: 'Solo' }, // Solo, Couple, Family, Friends
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      required: [true, 'Duration in days is required'],
      default: 3,
    },
    budget: {
      type: Number,
      required: true,
      default: 1000,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    preferences: {
      accommodation: [{ type: String }], // Hotel, Resort, Hostel, Apartment, Boutique
      food: [{ type: String }],          // Local, Street Food, Fine Dining, Vegetarian, Vegan, Halal
      activities: [{ type: String }],    // Beaches, Museums, Adventure, Nature, Nightlife, Shopping, Culture
    },
    itinerary: [dayItinerarySchema],
    hotels: [placeItemSchema],
    restaurants: [placeItemSchema],
    places: [placeItemSchema],
    expenses: {
      transportation: { type: Number, default: 0 },
      hotel: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      localTravel: { type: Number, default: 0 },
      miscellaneous: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      costPerPerson: { type: Number, default: 0 },
      remainingBudget: { type: Number, default: 0 },
    },
    tips: [{ type: String }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
