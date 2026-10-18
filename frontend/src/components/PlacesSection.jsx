import GmPlaceCard from './GmPlaceCard';

const PlacesSection = ({ places = [], onFocusLocation, onAddPlaceToItinerary }) => {
  if (!places || places.length === 0) {
    return <div className="section-empty">No attraction data retrieved.</div>;
  }

  return (
    <div className="hotels-grid">
      {places.map((place, index) => (
        <GmPlaceCard
          key={place.placeId || index}
          item={place}
          kind="attraction"
          onFocusLocation={onFocusLocation}
          onAddPlaceToItinerary={onAddPlaceToItinerary}
        />
      ))}
    </div>
  );
};

export default PlacesSection;
