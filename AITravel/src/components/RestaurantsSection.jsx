import { useState } from 'react';
import { Star, MapPin, Utensils, Filter, PlusCircle } from 'lucide-react';

const RestaurantsSection = ({ restaurants = [], onFocusLocation, onAddPlaceToItinerary }) => {
  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  if (!restaurants || restaurants.length === 0) {
    return <div className="section-empty">No restaurant data retrieved for this destination.</div>;
  }

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesRating = (r.rating || 0) >= Number(minRating);
    const matchesSearch = searchQuery
      ? r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesRating && matchesSearch;
  });

  return (
    <div className="restaurants-wrapper">
      {/* Filters Bar */}
      <div className="section-filter-bar">
        <div className="filter-input-group">
          <input
            type="text"
            placeholder="Filter cuisine or restaurant name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-input"
          />
        </div>
        <div className="filter-dropdown-group">
          <label><Filter size={14} /> Min Rating:</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="filter-select"
          >
            <option value="0">All Ratings</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.8">4.8+ Stars</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="hotels-grid">
        {filteredRestaurants.map((resto, index) => (
          <div key={resto.placeId || index} className="place-card restaurant-card">
            <div className="card-image-wrap">
              <img
                src={
                  resto.photos && resto.photos[0]
                    ? resto.photos[0]
                    : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
                }
                alt={resto.name}
                className="card-img"
                loading="lazy"
              />
              <div className="card-badge rating-badge">
                <Star size={13} className="star-icon" />
                <span>{resto.rating || '4.6'}</span>
                {resto.userRatingsTotal ? <small>({resto.userRatingsTotal})</small> : null}
              </div>
            </div>

            <div className="card-body">
              <div className="card-meta">
                <span className="card-category">
                  <Utensils size={13} /> {resto.cuisine || 'Local Specialties'}
                </span>
                <span className="price-tag">{resto.priceEstimate || '$$'}</span>
              </div>

              <h4 className="card-title">{resto.name}</h4>
              <p className="card-address">
                <MapPin size={13} />
                <span>{resto.address || resto.vicinity || 'Local Dining'}</span>
              </p>

              <div className="card-actions">
                {resto.latitude && resto.longitude && onFocusLocation && (
                  <button
                    className="btn-card-secondary"
                    onClick={() => onFocusLocation(resto.latitude, resto.longitude, resto.name)}
                  >
                    <MapPin size={14} /> View on Map
                  </button>
                )}
                {onAddPlaceToItinerary && (
                  <button
                    className="btn-card-primary"
                    onClick={() => onAddPlaceToItinerary(resto, 'restaurant')}
                  >
                    <PlusCircle size={14} /> Add to Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantsSection;
