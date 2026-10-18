import { useState } from 'react';
import { Star, MapPin, PlusCircle, Heart, Navigation } from 'lucide-react';

const FALLBACK_PHOTOS = {
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  ],
  attraction: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
  ],
};

/* Deterministic per-place pick — cards in the same category no longer all
   show the same stock image. */
const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
};

const pickFallbackPhoto = (kind, name) => {
  const pool = FALLBACK_PHOTOS[kind] || FALLBACK_PHOTOS.attraction;
  return pool[hashString(String(name || 'place')) % pool.length];
};

const KIND_LABELS = {
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  attraction: 'Attraction',
};

// Real Google place IDs start with "ChIJ"; everything else is an OSM/mock id
const isGooglePlaceId = (placeId) =>
  !!placeId && !/^(osm_|hotel_|rest_|attr_|default_)/.test(placeId);

const GmPlaceCard = ({ item, kind = 'hotel', onFocusLocation, onAddPlaceToItinerary }) => {
  const [saved, setSaved] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  const rating = Number(item.rating) || 0;
  const remotePhoto = item.photos && item.photos[0];
  const photo = !photoFailed && remotePhoto ? remotePhoto : pickFallbackPhoto(kind, item.name);

  const mapsSearchUrl = (() => {
    const query = encodeURIComponent(
      [item.name, item.address || item.vicinity].filter(Boolean).join(' ')
    );
    const placeIdParam = isGooglePlaceId(item.placeId) ? `&query_place_id=${item.placeId}` : '';
    return `https://www.google.com/maps/search/?api=1&query=${query}${placeIdParam}`;
  })();

  const directionsUrl =
    item.latitude && item.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
      : mapsSearchUrl;

  const metaLine = [item.category || KIND_LABELS[kind], item.cuisine].filter(Boolean).join(' · ');

  return (
    <div className="gm-card">
      <div className="gm-photo">
        <img
          src={photo}
          alt={item.name}
          className="gm-img"
          loading="lazy"
          onError={remotePhoto && !photoFailed ? () => setPhotoFailed(true) : undefined}
        />
        <button
          type="button"
          className={`gm-save ${saved ? 'is-saved' : ''}`}
          aria-label={saved ? 'Remove from saved' : 'Save place'}
          onClick={() => setSaved((s) => !s)}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {item.priceEstimate && <span className="gm-price">{item.priceEstimate}</span>}
        <span className="gm-kind">{KIND_LABELS[kind]}</span>
      </div>

      <div className="gm-body">
        <a className="gm-name" href={mapsSearchUrl} target="_blank" rel="noreferrer">
          {item.name}
        </a>

        {rating > 0 ? (
          <div className="gm-rating-row">
            <span className="gm-score">{rating.toFixed(1)}</span>
            <span className="gm-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={13}
                  className={`gm-star ${n <= Math.round(rating) ? 'filled' : ''}`}
                />
              ))}
            </span>
            {item.userRatingsTotal ? (
              <span className="gm-reviews">({Number(item.userRatingsTotal).toLocaleString()})</span>
            ) : null}
          </div>
        ) : (
          <div className="gm-rating-row">
            <span className="gm-new">New · No ratings yet</span>
          </div>
        )}

        {metaLine && <p className="gm-meta">{metaLine}</p>}

        <p className="gm-address">
          <MapPin size={13} />
          <span>{item.address || item.vicinity || 'Address available on Google Maps'}</span>
        </p>

        <div className="gm-actions">
          <a className="gm-btn" href={directionsUrl} target="_blank" rel="noreferrer">
            <Navigation size={14} /> Directions
          </a>
          {item.latitude && item.longitude && onFocusLocation && (
            <button
              type="button"
              className="gm-btn"
              onClick={() => onFocusLocation(item.latitude, item.longitude, item.name)}
            >
              <MapPin size={14} /> View on Map
            </button>
          )}
          {onAddPlaceToItinerary && (
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={() => onAddPlaceToItinerary(item, kind)}
            >
              <PlusCircle size={14} /> Add to Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GmPlaceCard;
