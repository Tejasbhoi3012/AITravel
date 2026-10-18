import express from 'express';
import {
  generateTrip,
  optimizeBudget,
  chat,
} from '../controllers/aiController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

/* Trip planning actions require an account; chat stays open so the
   landing-page demo assistant keeps working for guests. */
router.post('/generate-trip', aiLimiter, protect, generateTrip);
router.post('/optimize-budget', aiLimiter, protect, optimizeBudget);
router.post('/chat', aiLimiter, optionalAuth, chat);

export default router;
