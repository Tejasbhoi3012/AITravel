import axios from 'axios';
import { haversineDistanceKm } from './travelCostService.js';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/* Query results change slowly — cache briefly so retyping is instant. */
const SEARCH_CACHE = new Map();
const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Search destinations / places using Google Places Autocomplete or Text Search
 */
export const searchPlaces = async (query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const cacheKey = query.trim().toLowerCase();
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const results = await searchPlacesUncached(query);
  if (SEARCH_CACHE.size > 200) SEARCH_CACHE.clear();
  SEARCH_CACHE.set(cacheKey, { value: results, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
  return results;
};

const searchPlacesUncached = async (query) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query,
            key: apiKey,
          },
        }
      );

      if (response.data && response.data.status === 'OK' && response.data.results?.length > 0) {
        return response.data.results.map((place) => ({
          placeId: place.place_id,
          name: place.name,
          formattedAddress: place.formatted_address,
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng,
          rating: place.rating || 0,
          userRatingsTotal: place.user_ratings_total || 0,
          photos: place.photos?.map(
            (p) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${apiKey}`
          ) || [],
          types: place.types || [],
        }));
      } else {
        if (response.data?.status === 'REQUEST_DENIED') {
          console.warn('[Google Places API Note] Key provided but Places API is not enabled in Google Cloud Console. Using curated local dataset.');
        }
      }
    } catch (error) {
      console.warn('[Google Places API] Search error, falling back to local dataset:', error.message);
    }
  }

  // Free tier: OpenStreetMap Nominatim (no key, no billing)
  try {
    const osmResults = await searchPlacesOSM(query);
    if (osmResults.length > 0) {
      return osmResults;
    }
  } catch (osmError) {
    console.warn('[OSM] Nominatim search error, using curated dataset:', osmError.message);
  }

  // Graceful fallback destination data for development / when all providers fail
  return getFallbackDestinations(query);
};

/**
 * Reverse geocode coordinates into a place label (Google Geocoding API when
 * a key is present, otherwise Nominatim).
 */
export const reverseGeocode = async (latitude, longitude) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: apiKey,
          },
        }
      );

      const result = response.data?.results?.[0];
      if (result) {
        const components = result.address_components || [];
        const city =
          components.find((c) =>
            c.types.some((t) => ['locality', 'administrative_area_level_2', 'administrative_area_level_1'].includes(t))
          )?.long_name || '';
        return {
          placeId: result.place_id,
          name: city || (result.formatted_address || '').split(',')[0] || 'Current Location',
          country: components.find((c) => c.types.includes('country'))?.long_name || '',
          formattedAddress: result.formatted_address || '',
          latitude: Number(latitude),
          longitude: Number(longitude),
        };
      }
    } catch (error) {
      console.warn('[Google Geocoding] Reverse geocode error, trying OSM:', error.message);
    }
  }

  try {
    await nominatimThrottle();
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'jsonv2',
        addressdetails: 1,
      },
      headers: OSM_HEADERS,
      timeout: 12000,
    });

    const r = response.data;
    if (r && !r.error) {
      const addr = r.address || {};
      const name =
        addr.suburb ||
        addr.neighbourhood ||
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        (r.display_name || '').split(',')[0] ||
        'Current Location';
      return {
        placeId: r.osm_type ? `osm_${r.osm_type}_${r.osm_id}` : `geo_${latitude}_${longitude}`,
        name,
        country: addr.country || '',
        formattedAddress: r.display_name || '',
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    }
  } catch (error) {
    console.warn('[OSM] Nominatim reverse geocode error:', error.message);
  }

  return {
    placeId: `geo_${latitude}_${longitude}`,
    name: 'Current Location',
    country: '',
    formattedAddress: `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`,
    latitude: Number(latitude),
    longitude: Number(longitude),
  };
};

/**
 * Single-kind getters — thin wrappers over the unified POI pipeline below
 * (kept for the /places/hotels|restaurants|attractions endpoints).
 */
export const getHotels = async (latitude, longitude, destination = 'Destination') =>
  (await getNearbyPois(latitude, longitude, destination)).hotels;

export const getRestaurants = async (latitude, longitude, destination = 'Destination') =>
  (await getNearbyPois(latitude, longitude, destination)).restaurants;

export const getAttractions = async (latitude, longitude, destination = 'Destination') =>
  (await getNearbyPois(latitude, longitude, destination)).places;

/**
 * Helper to map Google Place JSON to standardized place object
 */
const mapGooglePlaceToItem = (place) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  return {
    placeId: place.place_id,
    name: place.name,
    rating: place.rating || 4.2,
    userRatingsTotal: place.user_ratings_total || 150,
    address: place.vicinity || place.formatted_address || '',
    vicinity: place.vicinity || '',
    latitude: place.geometry?.location?.lat || 0,
    longitude: place.geometry?.location?.lng || 0,
    photos: place.photos?.map(
      (p) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${apiKey}`
    ) || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
    priceLevel: place.price_level,
    priceEstimate: place.price_level ? '$'.repeat(place.price_level) : 'Price unavailable',
    category: place.types?.[0]?.replace(/_/g, ' ') || 'Attraction',
    cuisine: place.types?.includes('restaurant') ? 'Local & International' : '',
    openNow: place.opening_hours?.open_now ?? true,
    types: place.types || [],
  };
};

/* --- Free data providers: OpenStreetMap (no key, no billing) --- */

const OSM_HEADERS = {
  'User-Agent': 'TravelAI/1.0 (https://localhost; contact: admin@travelai.local)',
  Referer: 'http://localhost:5000/',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Real display name: at least 3 chars and containing a letter (any script). */
const hasMeaningfulName = (name) => {
  const trimmed = String(name || '').trim();
  return trimmed.length >= 3 && /[^\W\d_]/u.test(trimmed);
};

/* --- Real venue photos from free sources: OSM image tags, Wikimedia Commons
   links, and Wikidata P18 (image) claims — no API key or billing required. --- */

const commonsFileUrl = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(String(fileName).replace(/^File:/i, ''))}?width=800`;

/**
 * Extract a real photo URL from OSM-style tags. Handles direct image URLs
 * (`image` / `image:url`) and Wikimedia Commons file links
 * (`wikimedia_commons` or Commons page URLs inside `image`).
 */
const photoFromOsmTags = (tags = {}) => {
  const direct = tags.image || tags['image:url'];
  if (direct) {
    const pageMatch = String(direct).match(/commons\.wikimedia\.org\/wiki\/File:(.+)$/i);
    if (pageMatch) {
      try {
        return commonsFileUrl(decodeURIComponent(pageMatch[1]));
      } catch {
        return commonsFileUrl(pageMatch[1]);
      }
    }
    if (/^https?:\/\//i.test(direct)) return direct;
  }
  const commons = tags.wikimedia_commons;
  if (commons && !/^category:/i.test(commons)) return commonsFileUrl(commons);
  return null;
};

const WIKIDATA_CLAIM_CACHE = new Map(); // Q-id → { photo, latitude, longitude }

const parseWikidataEntity = (entity) => {
  const claims = entity?.claims || {};
  const file = claims.P18?.[0]?.mainsnak?.datavalue?.value;
  const coord = claims.P625?.[0]?.mainsnak?.datavalue?.value;
  return {
    photo: typeof file === 'string' ? commonsFileUrl(file) : null,
    latitude: coord ? Number(coord.latitude) : null,
    longitude: coord ? Number(coord.longitude) : null,
  };
};

/** Batch-fetch (and cache) P18 image + P625 coordinates for Wikidata IDs. */
const fetchWikidataClaims = async (qids) => {
  const pending = [...new Set(qids)].filter((qid) => qid && !WIKIDATA_CLAIM_CACHE.has(qid));
  if (pending.length === 0) return;
  try {
    const response = await axios.get('https://www.wikidata.org/w/api.php', {
      params: {
        action: 'wbgetentities',
        ids: pending.slice(0, 50).join('|'),
        props: 'claims',
        format: 'json',
      },
      headers: OSM_HEADERS,
      timeout: 10000,
    });
    const entities = response.data?.entities || {};
    for (const qid of pending) WIKIDATA_CLAIM_CACHE.set(qid, parseWikidataEntity(entities[qid]));
  } catch (error) {
    // Left uncached on purpose so a later request can retry.
    console.warn('[Wikidata] Claim lookup failed:', error.message);
  }
};

const WIKIDATA_SEARCH_CACHE = new Map(); // `${name}|${coords}` → photo URL | null

/**
 * Photo fallback for POIs without a Wikidata tag: search Wikidata by name and
 * accept a candidate only when its coordinates match the POI (≤3 km) — this
 * resolves aliases correctly ("Amer Palace" → Amber Fort) while rejecting
 * same-named entities elsewhere in the world.
 */
const findVenuePhotoByName = async (item) => {
  const name = String(item.name || '').trim();
  if (name.length < 4 || !item.latitude || !item.longitude) return null;
  const key = `${name.toLowerCase()}|${Number(item.latitude).toFixed(3)},${Number(item.longitude).toFixed(3)}`;
  if (WIKIDATA_SEARCH_CACHE.has(key)) return WIKIDATA_SEARCH_CACHE.get(key);

  let photo = null;
  try {
    const response = await axios.get('https://www.wikidata.org/w/api.php', {
      params: {
        action: 'wbsearchentities',
        search: name,
        language: 'en',
        limit: 3,
        type: 'item',
        format: 'json',
      },
      headers: OSM_HEADERS,
      timeout: 8000,
    });
    const qids = (response.data?.search || []).map((entity) => entity.id).filter(Boolean);
    if (qids.length > 0) {
      await fetchWikidataClaims(qids);
      const center = { latitude: Number(item.latitude), longitude: Number(item.longitude) };
      for (const qid of qids) {
        const claim = WIKIDATA_CLAIM_CACHE.get(qid);
        if (!claim?.photo || !claim.latitude) continue;
        const distance = haversineDistanceKm(center, { latitude: claim.latitude, longitude: claim.longitude });
        if (distance !== null && distance !== undefined && distance <= 3) {
          photo = claim.photo;
          break;
        }
      }
    }
  } catch (error) {
    console.warn('[Wikidata] Name search failed:', error.message);
    return null; // not cached — retried on a later request
  }
  WIKIDATA_SEARCH_CACHE.set(key, photo);
  return photo;
};

const PHOTO_NAME_SEARCH_LIMIT = 14;

/**
 * Fill `photos` for OSM POIs from free real-photo sources: OSM image tags,
 * Wikimedia Commons links, Wikidata P18 (by tag or coordinate-validated name
 * search). Items without any public photo keep `photos: []` — the UI applies
 * its styled fallback for those.
 */
const attachRealPhotos = async (result) => {
  const items = Object.values(result).flat();
  const directQids = items.map((item) => item.photoHint?.wikidata).filter(Boolean);
  if (directQids.length > 0) await fetchWikidataClaims(directQids);

  // Attractions first — they benefit most from Wikidata (landmarks are far
  // more likely to have an entity + photo than local hotels/restaurants).
  const queues = [];
  for (const bucket of ['places', 'hotels', 'restaurants']) {
    const bucketItems = result[bucket] || [];
    const queue = [];
    for (const item of bucketItems) {
      const hint = item.photoHint;
      if (hint) {
        const claim = hint.wikidata ? WIKIDATA_CLAIM_CACHE.get(hint.wikidata) : null;
        const photo = hint.image || claim?.photo || null;
        if (photo) item.photos = [photo];
        delete item.photoHint;
      }
      if ((!item.photos || item.photos.length === 0) && String(item.placeId || '').startsWith('osm_')) {
        queue.push(item);
      }
    }
    queues.push(queue);
  }

  // Round-robin across kinds so the search budget is shared fairly.
  const targets = [];
  for (let i = 0; targets.length < PHOTO_NAME_SEARCH_LIMIT; i += 1) {
    let picked = false;
    for (const queue of queues) {
      if (i < queue.length && targets.length < PHOTO_NAME_SEARCH_LIMIT) {
        targets.push(queue[i]);
        picked = true;
      }
    }
    if (!picked) break;
  }
  const concurrency = 5;
  for (let i = 0; i < targets.length; i += concurrency) {
    await Promise.all(
      targets.slice(i, i + concurrency).map(async (item) => {
        const photo = await findVenuePhotoByName(item);
        if (photo) item.photos = [photo];
      })
    );
  }
};

/* Nominatim usage policy: max 1 request/second across all callers. */
let nominatimLastAt = 0;
let nominatimChain = Promise.resolve();
const nominatimThrottle = () => {
  const next = nominatimChain.then(async () => {
    const wait = Math.max(0, 1100 - (Date.now() - nominatimLastAt));
    if (wait > 0) await sleep(wait);
    nominatimLastAt = Date.now();
  });
  nominatimChain = next.catch(() => {});
  return next;
};

/**
 * Geocode / search destinations via Nominatim (free, keyless).
 * Respects Nominatim usage policy: single request per call, descriptive UA.
 */
const searchPlacesOSM = async (query) => {
  await nominatimThrottle();
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: query,
      format: 'jsonv2',
      addressdetails: 1,
      limit: 6,
    },
    headers: OSM_HEADERS,
    timeout: 12000,
  });

  const results = Array.isArray(response.data) ? response.data : [];
  return results
    .map((r) => {
      const addr = r.address || {};
      const name = r.name || (r.display_name || '').split(',')[0] || query;
      return {
        placeId: `osm_${r.osm_type}_${r.osm_id}`,
        name,
        country: addr.country || '',
        formattedAddress: r.display_name || name,
        latitude: Number(r.lat) || 0,
        longitude: Number(r.lon) || 0,
        rating: null, // OSM has no ratings — UI shows "Unrated"
        userRatingsTotal: 0,
        photos: [],
        types: [r.type, r.category].filter(Boolean),
        source: 'osm',
      };
    })
    .filter((p) => p.latitude && p.longitude);
};

/* Planet-wide Overpass instances only — regional extracts (e.g. osm.ch) would
   misleadingly return empty results for the rest of the world. */
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const HOTEL_TAG_PATTERN = /hotel|hostel|guest_house|motel|apartment|resort|chalet|lodge/;
const DINING_TAG_PATTERN = /restaurant|cafe|fast_food|bar|pub|biergarten|food_court|ice_cream/;
const ATTRACTION_TAG_PATTERN = /attraction|museum|viewpoint|artwork|gallery|zoo|theme_park|aquarium/;

/**
 * POI category definitions — single source of truth for the Google radius &
 * type, Overpass selectors, tag matching, and Nominatim special-phrase
 * fallbacks. Adding a category here covers the whole pipeline.
 */
const POI_KINDS = {
  hotels: {
    bucket: 'hotels',
    radius: 10000,
    limit: 8,
    googleType: 'lodging',
    osmTag: 'tourism',
    osmPattern: HOTEL_TAG_PATTERN,
    matches: (tags) => HOTEL_TAG_PATTERN.test(tags.tourism || ''),
    nominatimQuery: 'hotels',
    nominatimCategory: 'tourism',
    nominatimTypes: HOTEL_TAG_PATTERN,
    fallback: (destination, lat, lng) => getFallbackHotels(destination, lat, lng),
  },
  restaurants: {
    bucket: 'restaurants',
    radius: 10000,
    limit: 8,
    googleType: 'restaurant',
    osmTag: 'amenity',
    osmPattern: DINING_TAG_PATTERN,
    matches: (tags) => DINING_TAG_PATTERN.test(tags.amenity || ''),
    nominatimQuery: 'restaurants',
    nominatimCategory: 'amenity',
    nominatimTypes: DINING_TAG_PATTERN,
    fallback: (destination, lat, lng) => getFallbackRestaurants(destination, lat, lng),
  },
  attractions: {
    bucket: 'places',
    radius: 15000,
    limit: 10,
    googleType: 'tourist_attraction',
    osmSelectors: [`nwr["tourism"~"${ATTRACTION_TAG_PATTERN.source}"]`, 'nwr["historic"]'],
    matches: (tags) => ATTRACTION_TAG_PATTERN.test(tags.tourism || '') || Boolean(tags.historic),
    nominatimQuery: 'attractions',
    nominatimCategory: /tourism|historic|leisure/,
    nominatimTypes: null,
    fallback: (destination, lat, lng) => getFallbackAttractions(destination, lat, lng),
  },
};

const MAX_POI_DISTANCE_KM = 60;

/**
 * POI fallback via Nominatim category search — a different infrastructure
 * from Overpass, so it often succeeds when all Overpass mirrors are down.
 * The search is geographically bounded to a viewbox around the destination
 * (plain phrase + bounded=1), because "keyword in <place>" phrasing leaks
 * results from other regions. Results are additionally validated by category
 * and must sit within MAX_POI_DISTANCE_KM of the destination.
 */
const nominatimPoiSearch = async (kind, destination, latitude, longitude) => {
  const cfg = POI_KINDS[kind];
  if (!destination || !cfg) return [];
  const center = { latitude: Number(latitude), longitude: Number(longitude) };
  const hasCenter = Number.isFinite(center.latitude) && Number.isFinite(center.longitude) && (center.latitude !== 0 || center.longitude !== 0);

  const box = hasCenter
    ? (() => {
        const km = cfg.radius / 1000; // POI radii are meters
        const dLat = km / 111;
        const dLng = km / (111 * Math.max(0.2, Math.cos((center.latitude * Math.PI) / 180)));
        return [center.longitude - dLng, center.latitude + dLat, center.longitude + dLng, center.latitude - dLat]
          .map((n) => n.toFixed(4))
          .join(',');
      })()
    : null;

  await nominatimThrottle();
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: cfg.nominatimQuery,
      ...(box ? { viewbox: box, bounded: 1 } : {}),
      format: 'jsonv2',
      addressdetails: 1,
      extratags: 1,
      limit: 20,
    },
    headers: OSM_HEADERS,
    timeout: 12000,
  });

  const results = Array.isArray(response.data) ? response.data : [];
  return results
    .filter((r) => {
      if (!r.lat || !r.lon) return false;
      if (!hasMeaningfulName(r.name)) return false;
      const cat = String(r.category || '');
      const type = String(r.type || '');
      const catOk = cfg.nominatimCategory instanceof RegExp
        ? cfg.nominatimCategory.test(cat)
        : cat === cfg.nominatimCategory;
      const typeOk = !cfg.nominatimTypes || cfg.nominatimTypes.test(type);
      if (!catOk || !typeOk) return false;
      if (hasCenter) {
        const distance = haversineDistanceKm(center, { latitude: Number(r.lat), longitude: Number(r.lon) });
        if (distance !== null && distance !== undefined && distance > MAX_POI_DISTANCE_KM) return false;
      }
      return true;
    })
    .map((r) => {
      const addr = r.address || {};
      const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
      const locale = addr.suburb || addr.city || addr.town || addr.village || '';
      const address = [street, locale].filter(Boolean).join(', ') || r.display_name || '';
      const prettyType = String(r.type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const category =
        kind === 'restaurants'
          ? (r.type === 'cafe' ? 'Cafe' : 'Dining')
          : (prettyType || (kind === 'hotels' ? 'Lodging' : 'Attraction'));
      const extra = r.extratags || {};
      const directPhoto = photoFromOsmTags(extra);
      const photoHint = {};
      if (directPhoto) photoHint.image = directPhoto;
      if (extra.wikidata) photoHint.wikidata = extra.wikidata;
      return {
        placeId: `osm_${r.osm_type}_${r.osm_id}`,
        name: r.name || (r.display_name || '').split(',')[0],
        rating: null,
        userRatingsTotal: 0,
        address,
        vicinity: address,
        latitude: Number(r.lat),
        longitude: Number(r.lon),
        photos: [], // filled by attachRealPhotos from free sources when available
        ...(Object.keys(photoHint).length > 0 ? { photoHint } : {}),
        priceEstimate: 'See listing',
        category,
        cuisine: r.extratags?.cuisine ? r.extratags.cuisine.replace(/;/g, ', ') : '',
        openNow: true,
        types: [r.category, r.type].filter(Boolean),
        source: 'osm',
      };
    })
    .filter((item) => hasMeaningfulName(item.name));
};

const cityHintFor = (destination) =>
  String(destination || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

const normalizeName = (name) =>
  String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Rank POIs: notable entries (those with a Wikidata ID — real landmarks with
 * photos) first, then entries inside the destination's own city/area, then
 * closest. Duplicate names (same place mapped on multiple OSM elements) are
 * collapsed, keeping the highest-ranked occurrence.
 */
const rankNearby = (items, latitude, longitude, destination = '') => {
  const hint = cityHintFor(destination);
  const center = { latitude: Number(latitude), longitude: Number(longitude) };

  return items
    .map((item) => {
      const distanceKm = haversineDistanceKm(center, item) ?? 9999;
      const haystack = `${item.address || ''} ${item.vicinity || ''} ${item.category || ''} ${item.name || ''}`.toLowerCase();
      const sameArea = hint.length > 1 && haystack.includes(hint);
      const notable = Boolean(item.photoHint?.wikidata);
      return { item, distanceKm, sameArea, notable };
    })
    .sort((a, b) => {
      if (a.notable !== b.notable) return a.notable ? -1 : 1;
      if (a.sameArea !== b.sameArea) return a.sameArea ? -1 : 1;
      return a.distanceKm - b.distanceKm;
    })
    .map((entry) => entry.item)
    .filter((item, index, arr) => {
      const key = normalizeName(item.name);
      if (!key) return true;
      return arr.findIndex((other) => normalizeName(other.name) === key) === index;
    });
};

const queryOverpassMirror = async (mirror, query) => {
  const response = await axios.post(
    mirror,
    new URLSearchParams({ data: query }).toString(),
    {
      headers: { ...OSM_HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 9000,
    }
  );
  return response.data?.elements || [];
};

/**
 * Race one Overpass query across all mirrors — the fastest healthy mirror
 * wins; racing three instances already provides the redundancy, so failures
 * fall through quickly to the Nominatim category fallback instead of
 * retrying individual mirrors.
 */
const overpassFetch = async (query) => {
  try {
    return await Promise.any(OVERPASS_MIRRORS.map((mirror) => queryOverpassMirror(mirror, query)));
  } catch {
    throw new Error('All Overpass mirrors unavailable');
  }
};

/**
 * All POI kinds in a single Overpass request (one round-trip instead of
 * three independent retry chains — much faster and less failure-prone).
 */
const buildPoiQuery = (lat, lng) => {
  const selectors = Object.values(POI_KINDS).flatMap((cfg) => {
    const around = `(around:${cfg.radius},${lat},${lng})`;
    const filters = cfg.osmSelectors || [`nwr["${cfg.osmTag}"~"${cfg.osmPattern.source}"]`];
    return filters.map((filter) => `${filter}${around};`);
  });
  return `[out:json][timeout:20];(${selectors.join('')});out center 400;`;
};

const fetchOsmPois = async (lat, lng, destination) => {
  const elements = await overpassFetch(buildPoiQuery(lat, lng));
  const buckets = { hotels: [], restaurants: [], places: [] };

  for (const element of elements) {
    const tags = element.tags || {};
    if (!tags.name) continue;
    for (const cfg of Object.values(POI_KINDS)) {
      if (cfg.matches(tags)) {
        const item = mapOsmElementToItem(element, cfg.bucket === 'places' ? 'attractions' : cfg.bucket);
        if (item) buckets[cfg.bucket].push(item);
        break; // one element belongs to a single bucket
      }
    }
  }

  return {
    hotels: rankNearby(buckets.hotels, lat, lng, destination).slice(0, POI_KINDS.hotels.limit),
    restaurants: rankNearby(buckets.restaurants, lat, lng, destination).slice(0, POI_KINDS.restaurants.limit),
    places: rankNearby(buckets.places, lat, lng, destination).slice(0, POI_KINDS.attractions.limit),
  };
};

const fetchGooglePois = async (lat, lng, destination) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const results = {};
  await Promise.all(
    Object.entries(POI_KINDS).map(async ([kind, cfg]) => {
      try {
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
          { params: { location: `${lat},${lng}`, radius: cfg.radius, type: cfg.googleType, key: apiKey } }
        );
        if (response.data?.status === 'OK' && response.data.results?.length > 0) {
          results[kind] = rankNearby(response.data.results.map(mapGooglePlaceToItem), lat, lng, destination).slice(0, cfg.limit);
        }
      } catch (error) {
        console.warn(`[Google Places API] ${kind} fetch error, trying OSM:`, error.message);
      }
    })
  );
  return results;
};

/* Results change slowly — cache per rounded coords + destination. */
const POI_CACHE = new Map();
const POI_CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Nearest POIs for a destination in one pass:
 * Google (only when a key is configured) → one combined Overpass query →
 * Nominatim special-phrase per still-empty kind → curated last resort.
 */
export const getNearbyPois = async (latitude, longitude, destination = 'Destination') => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!lat || !lng) return { hotels: [], restaurants: [], places: [] };

  const cacheKey = `${lat.toFixed(3)}|${lng.toFixed(3)}|${destination}`;
  const cached = POI_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const result = { hotels: [], restaurants: [], places: [] };

  if (process.env.GOOGLE_MAPS_API_KEY) {
    const google = await fetchGooglePois(lat, lng, destination);
    for (const [kind, items] of Object.entries(google)) result[POI_KINDS[kind].bucket] = items;
  }

  const unfilled = Object.keys(POI_KINDS).filter((kind) => result[POI_KINDS[kind].bucket].length === 0);
  if (unfilled.length > 0) {
    let nominatimKinds = unfilled;
    try {
      const osm = await fetchOsmPois(lat, lng, destination);
      nominatimKinds = [];
      for (const kind of unfilled) {
        const bucket = POI_KINDS[kind].bucket;
        if (osm[bucket].length > 0) result[bucket] = osm[bucket];
        else nominatimKinds.push(kind); // sparse area — try Nominatim
      }
    } catch (error) {
      console.warn('[OSM] Combined Overpass POI fetch failed, trying Nominatim fallback:', error.message);
    }

    for (const kind of nominatimKinds) {
      const cfg = POI_KINDS[kind];
      try {
        const items = await nominatimPoiSearch(kind, destination, lat, lng);
        if (items.length > 0) result[cfg.bucket] = rankNearby(items, lat, lng, destination).slice(0, cfg.limit);
      } catch (nominatimError) {
        console.warn(`[OSM] Nominatim ${kind} fallback error:`, nominatimError.message);
      }
    }
  }

  for (const cfg of Object.values(POI_KINDS)) {
    if (result[cfg.bucket].length === 0) result[cfg.bucket] = cfg.fallback(destination, lat, lng);
  }

  await attachRealPhotos(result);

  if (POI_CACHE.size > 100) {
    const now = Date.now();
    for (const [key, entry] of POI_CACHE) if (entry.expiresAt < now) POI_CACHE.delete(key);
  }
  POI_CACHE.set(cacheKey, { value: result, expiresAt: Date.now() + POI_CACHE_TTL_MS });
  return result;
};

const mapOsmElementToItem = (el, kind) => {
  const tags = el.tags || {};
  if (!hasMeaningfulName(tags.name)) return null;
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;

  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || '';
  const address = [street, city].filter(Boolean).join(', ');

  const category =
    kind === 'hotels'
      ? (tags.tourism || 'Lodging').replace(/_/g, ' ')
      : kind === 'restaurants'
        ? (tags.cuisine ? `${tags.cuisine} cuisine` : (tags.amenity || 'Dining').replace(/_/g, ' '))
        : (tags.tourism || tags.historic || 'Attraction').replace(/_/g, ' ');

  const directPhoto = photoFromOsmTags(tags);
  const photoHint = {};
  if (directPhoto) photoHint.image = directPhoto;
  if (tags.wikidata) photoHint.wikidata = tags.wikidata;

  return {
    placeId: `osm_${el.type}_${el.id}`,
    name: tags.name,
    rating: null, // OSM has no ratings — UI shows "Unrated"
    userRatingsTotal: 0,
    address,
    vicinity: address,
    latitude: Number(lat),
    longitude: Number(lon),
    photos: [], // filled by attachRealPhotos from free sources when available
    ...(Object.keys(photoHint).length > 0 ? { photoHint } : {}),
    priceEstimate: 'See listing',
    category,
    cuisine: tags.cuisine || '',
    openNow: true,
    types: [tags.tourism, tags.amenity, tags.historic].filter(Boolean),
    source: 'osm',
  };
};

/* --- Fallback generators for offline / mock testing --- */

/** Fallback labels use the destination's short city name ("Jaipur"), never
    the full "Jaipur, India" query string. */
const cityLabelFor = (destination) =>
  String(destination || 'Local').split(',')[0].trim() || 'Local';

const getFallbackDestinations = (query) => {
  const q = query.toLowerCase();
  const sample = [
    { placeId: 'goa_in', name: 'Goa', country: 'India', formattedAddress: 'Goa, India', latitude: 15.2993, longitude: 74.124, rating: 4.8 },
    { placeId: 'paris_fr', name: 'Paris', country: 'France', formattedAddress: 'Paris, France', latitude: 48.8566, longitude: 2.3522, rating: 4.9 },
    { placeId: 'tokyo_jp', name: 'Tokyo', country: 'Japan', formattedAddress: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, rating: 4.9 },
    { placeId: 'rome_it', name: 'Rome', country: 'Italy', formattedAddress: 'Rome, Italy', latitude: 41.9028, longitude: 12.4964, rating: 4.8 },
    { placeId: 'bali_id', name: 'Bali', country: 'Indonesia', formattedAddress: 'Bali, Indonesia', latitude: -8.3405, longitude: 115.092, rating: 4.9 },
    { placeId: 'dubai_ae', name: 'Dubai', country: 'United Arab Emirates', formattedAddress: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708, rating: 4.8 },
    { placeId: 'nyc_us', name: 'New York', country: 'United States', formattedAddress: 'New York, NY, USA', latitude: 40.7128, longitude: -74.006, rating: 4.8 },
    { placeId: 'london_uk', name: 'London', country: 'United Kingdom', formattedAddress: 'London, UK', latitude: 51.5074, longitude: -0.1278, rating: 4.8 },
  ];
  return sample.filter((item) => item.name.toLowerCase().includes(q) || item.country.toLowerCase().includes(q));
};

const getFallbackHotels = (rawDestination, lat, lng) => {
  const destination = cityLabelFor(rawDestination);
  return [
  {
    placeId: `hotel_1_${destination}`,
    name: `The Grand ${destination} Palace & Spa`,
    rating: 4.8,
    userRatingsTotal: 1240,
    address: `Central Promenade, ${destination}`,
    latitude: lat + 0.005,
    longitude: lng + 0.005,
    photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
    priceEstimate: 'Price unavailable',
    category: 'Luxury Resort',
    openNow: true,
  },
  {
    placeId: `hotel_2_${destination}`,
    name: `${destination} Boutique Suites`,
    rating: 4.6,
    userRatingsTotal: 850,
    address: `Old Town District, ${destination}`,
    latitude: lat - 0.004,
    longitude: lng + 0.008,
    photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
    priceEstimate: 'Price unavailable',
    category: 'Boutique Hotel',
    openNow: true,
  },
  {
    placeId: `hotel_3_${destination}`,
    name: `Ocean Breeze Villa & Resort`,
    rating: 4.7,
    userRatingsTotal: 960,
    address: `Coastline Boulevard, ${destination}`,
    latitude: lat + 0.012,
    longitude: lng - 0.006,
    photos: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'],
    priceEstimate: 'Price unavailable',
    category: 'Resort',
    openNow: true,
  },
  ];
};

const getFallbackRestaurants = (rawDestination, lat, lng) => {
  const destination = cityLabelFor(rawDestination);
  return [
  {
    placeId: `rest_1_${destination}`,
    name: `${destination} Heritage Bistro`,
    rating: 4.7,
    userRatingsTotal: 1520,
    address: `Heritage Square, ${destination}`,
    latitude: lat + 0.003,
    longitude: lng + 0.002,
    photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'],
    cuisine: 'Authentic Local & Coastal',
    priceEstimate: '$$',
    openNow: true,
  },
  {
    placeId: `rest_2_${destination}`,
    name: `The Sunset Terrace Grill`,
    rating: 4.8,
    userRatingsTotal: 2100,
    address: `Cliffside Bay, ${destination}`,
    latitude: lat + 0.009,
    longitude: lng - 0.004,
    photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
    cuisine: 'Seafood & Mediterranean',
    priceEstimate: '$$$',
    openNow: true,
  },
  {
    placeId: `rest_3_${destination}`,
    name: `Green Leaf Garden Cafe`,
    rating: 4.6,
    userRatingsTotal: 680,
    address: `Market Lane, ${destination}`,
    latitude: lat - 0.006,
    longitude: lng - 0.002,
    photos: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'],
    cuisine: 'Artisan Cafe & Healthy Vegan',
    priceEstimate: '$',
    openNow: true,
  },
  ];
};

const getFallbackAttractions = (rawDestination, lat, lng) => {
  const destination = cityLabelFor(rawDestination);
  return [
  {
    placeId: `attr_1_${destination}`,
    name: `Historic Landmark & Fort of ${destination}`,
    rating: 4.8,
    userRatingsTotal: 4300,
    address: `Fortification Point, ${destination}`,
    latitude: lat + 0.015,
    longitude: lng + 0.01,
    photos: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
    category: 'Historical Landmark',
    openNow: true,
  },
  {
    placeId: `attr_2_${destination}`,
    name: `${destination} Botanical Sanctuary`,
    rating: 4.7,
    userRatingsTotal: 1890,
    address: `Valley Road, ${destination}`,
    latitude: lat - 0.01,
    longitude: lng + 0.012,
    photos: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'],
    category: 'Nature & Parks',
    openNow: true,
  },
  {
    placeId: `attr_3_${destination}`,
    name: `${destination} Cultural Promenade & Arts`,
    rating: 4.9,
    userRatingsTotal: 3400,
    address: `Waterfront Walk, ${destination}`,
    latitude: lat + 0.002,
    longitude: lng - 0.008,
    photos: ['https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80'],
    category: 'Arts & Culture',
    openNow: true,
  },
  ];
};
