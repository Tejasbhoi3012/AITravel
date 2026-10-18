import { getRate } from './currencyService.js';

const toRad = (deg) => (deg * Math.PI) / 180;

const hasValidCoords = (p) =>
  p &&
  p.latitude != null &&
  p.longitude != null &&
  Number.isFinite(Number(p.latitude)) &&
  Number.isFinite(Number(p.longitude)) &&
  Math.abs(Number(p.latitude)) <= 90 &&
  Math.abs(Number(p.longitude)) <= 180;

export const haversineDistanceKm = (from, to) => {
  if (!hasValidCoords(from) || !hasValidCoords(to)) return null;
  const fromLat = Number(from.latitude);
  const fromLng = Number(from.longitude);
  const toLat = Number(to.latitude);
  const toLng = Number(to.longitude);

  const R = 6371;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * R * Math.asin(Math.sqrt(a));
  return Math.max(1, Math.round(km));
};

const roundTripPerPersonINR = (distanceKm) => {
  if (distanceKm < 100) {
    return { mode: 'Road (cab / bus)', perPerson: Math.max(600, distanceKm * 16) };
  }
  if (distanceKm < 600) {
    return { mode: 'Train / express bus', perPerson: Math.max(1400, distanceKm * 2.6) };
  }
  if (distanceKm < 2500) {
    return { mode: 'Flight (economy)', perPerson: 3400 + distanceKm * 5.4 };
  }
  return { mode: 'International flight (economy)', perPerson: 9500 + distanceKm * 9 };
};

export const estimateTravelCost = ({ origin, destination, travelers = 1, currency = 'INR' }) => {
  const distanceKm = haversineDistanceKm(origin, destination);
  if (distanceKm === null) return null;

  const code = String(currency || 'INR').toUpperCase();
  const rate = getRate(code);
  const count = Math.max(1, Math.round(Number(travelers) || 1));
  const { mode, perPerson } = roundTripPerPersonINR(distanceKm);
  const costPerPerson = Math.max(1, Math.round(perPerson * rate));
  const total = costPerPerson * count;

  return {
    distanceKm,
    mode,
    currency: code,
    costPerPerson,
    total,
    travelers: count,
  };
};
