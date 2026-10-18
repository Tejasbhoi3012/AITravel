import api from './api.js';

/**
 * Live exchange rates (INR base) with a 6-hour cache in memory +
 * localStorage, so switching currencies always converts with current rates.
 */
const CACHE_KEY = 'travelai_fx_rates';
const TTL_MS = 6 * 60 * 60 * 1000;

export const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'AED ' };

const readCache = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return parsed?.rates ? parsed : null;
  } catch {
    return null;
  }
};

let memo = readCache();

export const getCurrencyRates = async () => {
  if (memo && Date.now() - memo.fetchedAt < TTL_MS) return memo;
  const { data } = await api.get('/currency/rates');
  memo = {
    base: data.base || 'INR',
    rates: data.rates || {},
    updatedAt: data.updatedAt || null,
    source: data.source || '',
    fetchedAt: Date.now(),
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memo));
  } catch {
    /* storage full / private mode — memory cache still works */
  }
  return memo;
};

/** Convert between any two supported currencies using INR-based rates. */
export const convertAmount = (amount, from, to, rates) => {
  const value = Number(amount) || 0;
  if (!rates || !from || !to || from === to) return Math.round(value);
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  return Math.round(value * (toRate / fromRate));
};
