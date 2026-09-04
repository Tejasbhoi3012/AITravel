import { Star, MapPin, Compass, PlusCircle } from 'lucide-react';

const PlacesSection = ({ places = [], onFocusLocation, onAddPlaceToItinerary }) => {
  if (!places || places.length === 0) {
    return <div className="section-empty">No attraction data retrieved.</div>;
  }

  return (
    <div className="hotels-grid">
      {places.map((place, index) => (
        <div key={place.placeId || index} className="place-card sight-card">
          <div className="card-image-wrap">
            <img
              src={
                place.photos && place.photos[0]
                  ? place.photos[0]
                  : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
              }
              alt={place.name}
              className="card-img"
              loading="lazy"
            />
            <div className="card-badge rating-badge">
              <Star size={13} className="star-icon" />
              <span>{place.rating || '4.8'}</span>
              {place.userRatingsTotal ? <small>({place.userRatingsTotal})</small> : null}
            </div>
          </div>

          <div className="card-body">
            <div className="card-meta">
              <span className="card-category">
                <Compass size={13} /> {place.category || 'Sightseeing'}
              </span>
            </div>

            <h4 className="card-title">{place.name}</h4>
            <p className="card-address">
              <MapPin size={13} />
              <span>{place.address || place.vicinity || 'Local Attraction'}</span>
            </p>

            <div className="card-actions">
              {place.latitude && place.longitude && onFocusLocation && (
                <button
                  className="btn-card-secondary"
                  onClick={() => onFocusLocation(place.latitude, place.longitude, place.name)}
                >
                  <MapPin size={14} /> View on Map
                </button>
              )}
              {onAddPlaceToItinerary && (
                <button
                  className="btn-card-primary"
                  onClick={() => onAddPlaceToItinerary(place, 'attraction')}
                >
                  <PlusCircle size={14} /> Add to Trip
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlacesSection;
