import { planFullTrip } from '../services/tripPlanningService.js';
import { optimizeBudgetWithGemini, chatWithAssistant } from '../services/geminiService.js';
import Trip from '../models/Trip.js';

// @desc    Generate a complete AI Trip with Places, Gemini itinerary & expenses
// @route   POST /api/ai/generate-trip
// @access  Public / Private
export const generateTrip = async (req, res, next) => {
  try {
    const { destination, destinationDetails, origin, travelers, startDate, endDate, duration, budget, currency, preferences } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, message: 'Destination is required' });
    }

    const userId = req.user ? req.user._id : null;

    // Orchestrate complete planning pipeline
    const tripPlan = await planFullTrip({
      destination,
      destinationDetails: destinationDetails || null,
      origin: origin || null,
      travelers: travelers || { count: 1, type: 'Solo' },
      startDate: startDate || '',
      endDate: endDate || '',
      duration: Number(duration) || 3,
      budget: Number(budget) || 1000,
      currency: currency || 'USD',
      preferences: preferences || { accommodation: [], food: [], activities: [] },
      userId,
    });

    // Save directly to MongoDB
    let savedTrip;
    try {
      savedTrip = await Trip.create(tripPlan);
    } catch (dbErr) {
      console.warn('[DB Notice] MongoDB save deferred, returning memory object:', dbErr.message);
      savedTrip = { ...tripPlan, _id: `trip_${Date.now()}` };
    }

    res.status(201).json({
      success: true,
      tripId: savedTrip._id,
      trip: savedTrip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Budget Optimization
// @route   POST /api/ai/optimize-budget
// @access  Public / Private
export const optimizeBudget = async (req, res, next) => {
  try {
    const { trip, expenses, budget, currency, travelers } = req.body;

    if (!trip || !expenses) {
      return res.status(400).json({ success: false, message: 'Trip and expenses are required' });
    }

    const optimization = await optimizeBudgetWithGemini({
      trip,
      expenses,
      budget: budget || trip.budget || 1000,
      currency: currency || trip.currency || 'USD',
      travelers: travelers || trip.travelers?.count || 1,
    });

    res.json({
      success: true,
      optimization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with contextual AI Travel Assistant
// @route   POST /api/ai/chat
// @access  Public / Private
export const chat = async (req, res, next) => {
  try {
    const { message, trip, chatHistory, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const responseText = await chatWithAssistant({
      message,
      trip: trip || {},
      chatHistory: chatHistory || history || [],
    });

    res.json({
      success: true,
      reply: responseText,
    });
  } catch (error) {
    next(error);
  }
};
