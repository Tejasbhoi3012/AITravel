import axios from 'axios';

/**
 * Live exchange rates (INR base) from open.er-api.com — free, no API key,
 * refreshed daily upstream. Cached in memory for 6 hours; static fallback
 * values keep the app working when the provider is unreachable.
 */
const BASE = 'INR';
const TTL_MS = 6 * 60 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000;
const RATES_URL = `https://open.er-api.com/v6/latest/${BASE}`;

const SUPPORTED = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY'];

const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  JPY: 1.8,
};

let cache = { rates: FALLBACK_RATES, updatedAt: null, source: 'static' };
let nextRefreshAt = 0;

export const refreshCurrencyRates = async () => {
  if (Date.now() < nextRefreshAt) return cache;
  try {
    const response = await axios.get(RATES_URL, { timeout: 10000 });
    const rates = response.data?.rates;
    if (response.data?.result === 'success' && rates) {
      const live = {};
      for (const code of SUPPORTED) {
        const value = Number(rates[code]);
        if (Number.isFinite(value) && value > 0) live[code] = value;
      }
      cache = {
        rates: live,
        updatedAt: response.data.time_last_update_utc || new Date().toUTCString(),
        source: 'open.er-api.com',
      };
      nextRefreshAt = Date.now() + TTL_MS;
    } else {
      nextRefreshAt = Date.now() + RETRY_MS;
    }
  } catch (error) {
    console.warn('[Currency] Live rates unavailable, keeping', cache.source, 'rates:', error.message);
    nextRefreshAt = Date.now() + RETRY_MS;
  }
  return cache;
};

/** Latest cached rates — safe to use synchronously. */
export const getCurrencyRates = () => cache;

/** Rate to convert 1 INR into the given currency (1 when unknown). */
export const getRate = (code) => cache.rates[String(code || 'INR').toUpperCase()] || 1;

export const BASE_CURRENCY = BASE;
