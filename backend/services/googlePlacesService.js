import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Search destinations / places using Google Places Autocomplete or Text Search
 */
export const searchPlaces = async (query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

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
 * Search nearby hotels / lodging
 */
export const getHotels = async (latitude, longitude, destination = 'Destination') => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey && latitude && longitude) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${latitude},${longitude}`,
            radius: 15000,
            type: 'lodging',
            key: apiKey,
          },
        }
      );

      if (response.data && response.data.status === 'OK' && response.data.results?.length > 0) {
        return response.data.results.slice(0, 8).map(mapGooglePlaceToItem);
      }
    } catch (error) {
      console.warn('[Google Places API] Hotels fetch error, trying OSM:', error.message);
    }
  }

  // Free tier: OpenStreetMap Overpass (no key, no billing)
  if (latitude && longitude) {
    try {
      const osmHotels = await overpassNearby(latitude, longitude, 'hotels');
      if (osmHotels.length > 0) {
        return osmHotels;
      }
    } catch (osmError) {
      console.warn('[OSM] Overpass hotels error, using curated dataset:', osmError.message);
    }
  }

  return getFallbackHotels(destination, latitude, longitude);
};

/**
 * Search nearby restaurants / dining
 */
export const getRestaurants = async (latitude, longitude, destination = 'Destination') => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey && latitude && longitude) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${latitude},${longitude}`,
            radius: 15000,
            type: 'restaurant',
            key: apiKey,
          },
        }
      );

      if (response.data && response.data.status === 'OK' && response.data.results?.length > 0) {
        return response.data.results.slice(0, 8).map(mapGooglePlaceToItem);
      }
    } catch (error) {
      console.warn('[Google Places API] Restaurants fetch error, trying OSM:', error.message);
    }
  }

  // Free tier: OpenStreetMap Overpass (no key, no billing)
  if (latitude && longitude) {
    try {
      const osmRestaurants = await overpassNearby(latitude, longitude, 'restaurants');
      if (osmRestaurants.length > 0) {
        return osmRestaurants;
      }
    } catch (osmError) {
      console.warn('[OSM] Overpass restaurants error, using curated dataset:', osmError.message);
    }
  }

  return getFallbackRestaurants(destination, latitude, longitude);
};

/**
 * Search tourist attractions / sights
 */
export const getAttractions = async (latitude, longitude, destination = 'Destination') => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey && latitude && longitude) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${latitude},${longitude}`,
            radius: 20000,
            type: 'tourist_attraction',
            key: apiKey,
          },
        }
      );

      if (response.data && response.data.status === 'OK' && response.data.results?.length > 0) {
        return response.data.results.slice(0, 10).map(mapGooglePlaceToItem);
      }
    } catch (error) {
      console.warn('[Google Places API] Attractions fetch error, trying OSM:', error.message);
    }
  }

  // Free tier: OpenStreetMap Overpass (no key, no billing)
  if (latitude && longitude) {
    try {
      const osmAttractions = await overpassNearby(latitude, longitude, 'attractions');
      if (osmAttractions.length > 0) {
        return osmAttractions;
      }
    } catch (osmError) {
      console.warn('[OSM] Overpass attractions error, using curated dataset:', osmError.message);
    }
  }

  return getFallbackAttractions(destination, latitude, longitude);
};

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

/**
 * Geocode / search destinations via Nominatim (free, keyless).
 * Respects Nominatim usage policy: single request per call, descriptive UA.
 */
const searchPlacesOSM = async (query) => {
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
        types: [r.type, r.class].filter(Boolean),
        source: 'osm',
      };
    })
    .filter((p) => p.latitude && p.longitude);
};

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const overpassFilterFor = (kind, radius, lat, lng) => {
  const around = `(around:${radius},${lat},${lng})`;
  if (kind === 'hotels') {
    return `nwr["tourism"~"hotel|hostel|guest_house|motel|apartment|resort|chalet|lodge"]${around};`;
  }
  if (kind === 'restaurants') {
    return `nwr["amenity"~"restaurant|cafe|fast_food|bar|pub|biergarten|food_court|ice_cream"]${around};`;
  }
  // attractions: tagged sights + anything historic
  return `nwr["tourism"~"attraction|museum|viewpoint|artwork|gallery|zoo|theme_park|aquarium"]${around};nwr["historic"]${around};`;
};

/**
 * Nearby POIs via Overpass API (free, keyless). Returns standardized items.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const queryOverpassMirror = async (mirror, query) => {
  const response = await axios.post(
    mirror,
    new URLSearchParams({ data: query }).toString(),
    {
      headers: { ...OSM_HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    }
  );
  return response.data?.elements || [];
};

/**
 * Nearby POIs via Overpass API (free, keyless). Returns standardized items.
 * Tries multiple public mirrors + one retry — falls back to curated data
 * when the public instances are rate-limiting (HTTP 429) or slow.
 */
const overpassNearby = async (latitude, longitude, kind) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!lat || !lng) return [];

  const radius = 15000;
  const limit = 8;
  const query = `[out:json][timeout:15];(${overpassFilterFor(kind, radius, lat, lng)});out center ${limit};`;

  let lastError = null;
  for (const mirror of OVERPASS_MIRRORS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const elements = await queryOverpassMirror(mirror, query);
        const items = elements.map((el) => mapOsmElementToItem(el, kind)).filter(Boolean);
        if (items.length > 0) {
          return items.slice(0, limit);
        }
        return []; // mirror OK but area has no tagged POIs — don't hammer others
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        if (status === 429) {
          await sleep(1500); // back off, then retry / next mirror
        } else if (attempt === 0 && !status) {
          await sleep(800); // transient network timeout — one retry
        } else {
          break; // non-retryable — try next mirror
        }
      }
    }
  }

  throw lastError || new Error('Overpass mirrors unavailable');
};

const mapOsmElementToItem = (el, kind) => {
  const tags = el.tags || {};
  if (!tags.name) return null;
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

  return {
    placeId: `osm_${el.type}_${el.id}`,
    name: tags.name,
    rating: null, // OSM has no ratings — UI shows "Unrated"
    userRatingsTotal: 0,
    address,
    vicinity: address,
    latitude: Number(lat),
    longitude: Number(lon),
    photos: [], // card components fall back to stock imagery
    priceEstimate: 'See listing',
    category,
    cuisine: tags.cuisine || '',
    openNow: true,
    types: [tags.tourism, tags.amenity, tags.historic].filter(Boolean),
    source: 'osm',
  };
};

/* --- Fallback generators for offline / mock testing --- */

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

const getFallbackHotels = (destination, lat = 15.2993, lng = 74.124) => [
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

const getFallbackRestaurants = (destination, lat = 15.2993, lng = 74.124) => [
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

const getFallbackAttractions = (destination, lat = 15.2993, lng = 74.124) => [
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
