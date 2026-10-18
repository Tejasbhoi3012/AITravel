import { getCurrencyRates, refreshCurrencyRates, BASE_CURRENCY } from '../services/currencyService.js';

// @desc    Current exchange rates (INR base) with live refresh
// @route   GET /api/currency/rates
// @access  Public
export const getRates = async (req, res, next) => {
  try {
    await refreshCurrencyRates();
    const { rates, updatedAt, source } = getCurrencyRates();
    res.json({ success: true, base: BASE_CURRENCY, rates, updatedAt, source });
  } catch (error) {
    next(error);
  }
};
