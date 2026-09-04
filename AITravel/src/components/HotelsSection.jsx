import { Star, MapPin, Building, PlusCircle } from 'lucide-react';

const HotelsSection = ({ hotels = [], onFocusLocation, onAddPlaceToItinerary }) => {
  if (!hotels || hotels.length === 0) {
    return <div className="section-empty">No hotels retrieved for this location.</div>;
  }

  return (
    <div className="hotels-grid">
      {hotels.map((hotel, index) => (
        <div key={hotel.placeId || index} className="place-card hotel-card">
          <div className="card-image-wrap">
            <img
              src={
                hotel.photos && hotel.photos[0]
                  ? hotel.photos[0]
                  : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
              }
              alt={hotel.name}
              className="card-img"
              loading="lazy"
            />
            <div className="card-badge rating-badge">
              <Star size={13} className="star-icon" />
              <span>{hotel.rating || '4.5'}</span>
              {hotel.userRatingsTotal ? <small>({hotel.userRatingsTotal})</small> : null}
            </div>
          </div>

          <div className="card-body">
            <div className="card-meta">
              <span className="card-category">
                <Building size={13} /> {hotel.category || 'Lodging'}
              </span>
              <span className="price-tag">
                {hotel.priceEstimate || 'Price unavailable'}
              </span>
            </div>

            <h4 className="card-title">{hotel.name}</h4>
            <p className="card-address">
              <MapPin size={13} />
              <span>{hotel.address || hotel.vicinity || 'Address available upon booking'}</span>
            </p>

            <div className="card-actions">
              {hotel.latitude && hotel.longitude && onFocusLocation && (
                <button
                  className="btn-card-secondary"
                  onClick={() => onFocusLocation(hotel.latitude, hotel.longitude, hotel.name)}
                >
                  <MapPin size={14} /> View on Map
                </button>
              )}
              {onAddPlaceToItinerary && (
                <button
                  className="btn-card-primary"
                  onClick={() => onAddPlaceToItinerary(hotel, 'hotel')}
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

export default HotelsSection;
