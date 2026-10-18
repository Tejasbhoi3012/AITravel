import { useState } from 'react';
import { Filter } from 'lucide-react';
import GmPlaceCard from './GmPlaceCard';

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
      {filteredRestaurants.length === 0 ? (
        <div className="section-empty">No restaurants match your filters.</div>
      ) : (
        <div className="hotels-grid">
          {filteredRestaurants.map((resto, index) => (
            <GmPlaceCard
              key={resto.placeId || index}
              item={resto}
              kind="restaurant"
              onFocusLocation={onFocusLocation}
              onAddPlaceToItinerary={onAddPlaceToItinerary}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantsSection;
