import Trip from '../models/Trip.js';
import crypto from 'crypto';

// @desc    Create a new Trip
// @route   POST /api/trips
// @access  Public / Private (attaches user if authenticated)
export const createTrip = async (req, res, next) => {
  try {
    const tripData = { ...req.body };
    if (req.user) {
      tripData.userId = req.user._id;
    }

    const trip = await Trip.create(tripData);
    res.status(201).json({ success: true, tripId: trip._id, trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's trips
// @route   GET /api/trips
// @access  Private
export const getUserTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Public / Private
export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Allow access if trip is public, or if no user is assigned, or if requesting user owns the trip
    if (
      trip.isPublic ||
      !trip.userId ||
      (req.user && trip.userId.toString() === req.user._id.toString())
    ) {
      return res.json({ success: true, trip });
    }

    return res.status(403).json({ success: false, message: 'Not authorized to view this private trip' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip (itinerary, budget, expenses, activities, hotels, restaurants)
// @route   PUT /api/trips/:id
// @access  Private / Public (owner only if claimed)
export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId && (!req.user || trip.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this trip' });
    }

    // Calculate updated expense summary if expenses or activities changed
    if (req.body.expenses) {
      const expenses = { ...trip.expenses, ...req.body.expenses };
      const total = (
        (Number(expenses.transportation) || 0) +
        (Number(expenses.hotel) || 0) +
        (Number(expenses.food) || 0) +
        (Number(expenses.activities) || 0) +
        (Number(expenses.localTravel) || 0) +
        (Number(expenses.miscellaneous) || 0)
      );
      const count = Number(trip.travelers?.count) || 1;
      expenses.total = total;
      expenses.costPerPerson = Math.round(total / count);
      expenses.remainingBudget = (Number(trip.budget) || total) - total;
      req.body.expenses = expenses;
    }

    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, trip: updatedTrip });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId && (!req.user || trip.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this trip' });
    }

    await trip.deleteOne();
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate an existing trip
// @route   POST /api/trips/:id/duplicate
// @access  Private
export const duplicateTrip = async (req, res, next) => {
  try {
    const existingTrip = await Trip.findById(req.params.id);

    if (!existingTrip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const tripObj = existingTrip.toObject();
    delete tripObj._id;
    delete tripObj.createdAt;
    delete tripObj.updatedAt;
    delete tripObj.shareToken;

    tripObj.destination = `${tripObj.destination} (Copy)`;
    tripObj.userId = req.user ? req.user._id : existingTrip.userId;
    tripObj.isPublic = false;

    const duplicatedTrip = await Trip.create(tripObj);
    res.status(201).json({ success: true, tripId: duplicatedTrip._id, trip: duplicatedTrip });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Share Trip & generate shareable link
// @route   POST /api/trips/:id/share
// @access  Private / Public (owner)
export const shareTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId && (!req.user || trip.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to share this trip' });
    }

    trip.isPublic = !trip.isPublic;
    if (trip.isPublic && !trip.shareToken) {
      trip.shareToken = crypto.randomBytes(16).toString('hex');
    }

    await trip.save();

    res.json({
      success: true,
      isPublic: trip.isPublic,
      shareToken: trip.shareToken,
      shareUrl: `/trip/${trip._id}?token=${trip.shareToken || ''}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip by share token
// @route   GET /api/trips/share/:token
// @access  Public
export const getSharedTripByToken = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ shareToken: req.params.token, isPublic: true });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Shared trip not found or link has expired' });
    }

    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};
