import GmPlaceCard from './GmPlaceCard';

const HotelsSection = ({ hotels = [], onFocusLocation, onAddPlaceToItinerary }) => {
  if (!hotels || hotels.length === 0) {
    return <div className="section-empty">No hotels retrieved for this location.</div>;
  }

  return (
    <div className="hotels-grid">
      {hotels.map((hotel, index) => (
        <GmPlaceCard
          key={hotel.placeId || index}
          item={hotel}
          kind="hotel"
          onFocusLocation={onFocusLocation}
          onAddPlaceToItinerary={onAddPlaceToItinerary}
        />
      ))}
    </div>
  );
};

export default HotelsSection;
