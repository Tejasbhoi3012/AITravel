import express from 'express';
import {
  generateTrip,
  optimizeBudget,
  chat,
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/generate-trip', aiLimiter, optionalAuth, generateTrip);
router.post('/optimize-budget', aiLimiter, optionalAuth, optimizeBudget);
router.post('/chat', aiLimiter, optionalAuth, chat);

export default router;
