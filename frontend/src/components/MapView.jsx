import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

const CATEGORY_COLORS = {
  hotel: '#025a9e',
  restaurant: '#d97706',
  place: '#059669',
};

// Flies the Leaflet map to the focused pin and fits all pins on filter change.
// No API key, no billing — tiles come from OpenStreetMap.
const MapController = ({ focus, items }) => {
  const map = useMap();

  useEffect(() => {
    if (focus && focus.lat && focus.lng) {
      map.flyTo([focus.lat, focus.lng], 14, { duration: 0.8 });
    }
  }, [map, focus?.lat, focus?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (items && items.length > 0) {
      map.fitBounds(
        items.map((i) => [i.lat, i.lng]),
        { padding: [32, 32] }
      );
    }
  }, [map, items]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

const normalize = (item, type) => ({
  ...item,
  name: item.name || 'Unnamed location',
  lat: Number(item.lat ?? item.latitude) || 0,
  lng: Number(item.lng ?? item.longitude) || 0,
  category: type,
});

const ratingLabel = (item) => {
  if (item.rating) return `★ ${item.rating}`;
  return 'Unrated • OSM';
};

const MapView = ({
  center = { lat: 20.5937, lng: 78.9629 },
  destination = 'Destination',
  hotels = [],
  restaurants = [],
  places = [],
  focusedLocation = null,
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [focus, setFocus] = useState(null);

  const allItems = useMemo(() => [
    ...hotels.map((h) => normalize(h, 'hotel')),
    ...restaurants.map((r) => normalize(r, 'restaurant')),
    ...places.map((p) => normalize(p, 'place')),
  ].filter((i) => i.lat && i.lng), [hotels, restaurants, places]);

  const filteredItems = useMemo(() => (
    activeCategory === 'all' ? allItems : allItems.filter((item) => item.category === activeCategory)
  ), [allItems, activeCategory]);

  const hotelCount = useMemo(() => allItems.filter((i) => i.category === 'hotel').length, [allItems]);
  const restaurantCount = useMemo(() => allItems.filter((i) => i.category === 'restaurant').length, [allItems]);
  const placeCount = useMemo(() => allItems.filter((i) => i.category === 'place').length, [allItems]);

  const activeLat = focusedLocation?.lat || focus?.lat || center?.lat || 20.5937;
  const activeLng = focusedLocation?.lng || focus?.lng || center?.lng || 78.9629;

  const handlePanTo = (item) => {
    setSelectedItem(item);
    if (item.lat && item.lng) {
      setFocus({ lat: item.lat, lng: item.lng });
    }
  };

  const filterBtn = (key, label, count) => {
    const isActive = activeCategory === key;
    const activeBg = key === 'restaurant' ? '#d97706' : key === 'place' ? '#059669' : '#025a9e';
    return (
      <button
        key={key}
        onClick={() => setActiveCategory(key)}
        style={{
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          border: 'none',
          background: isActive ? activeBg : '#f1f5f9',
          color: isActive ? '#fff' : '#475569',
          transition: 'all 0.15s ease',
        }}
      >
        {label} ({count})
      </button>
    );
  };

  return (
    <div className="map-view-wrapper" style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
      {/* Top Header & Interactive Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="#025a9e" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Interactive Route &amp; Location Map
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Exploring <strong>{destination}</strong> ({Number(activeLat).toFixed(4)}, {Number(activeLng).toFixed(4)}) • {filteredItems.length} locations mapped
          </p>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filterBtn('all', 'All Pins', allItems.length)}
          {filterBtn('hotel', '🏨 Stays', hotelCount)}
          {filterBtn('restaurant', '🍽️ Dining', restaurantCount)}
          {filterBtn('place', '📍 Attractions', placeCount)}
        </div>
      </div>

      {/* Main Map Container — Leaflet + OpenStreetMap, keyless */}
      <div style={{ position: 'relative', width: '100%', height: '480px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        <MapContainer
          center={[activeLat, activeLng]}
          zoom={11}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController
            focus={focusedLocation || focus}
            items={filteredItems}
          />
          {filteredItems.map((item, idx) => {
            const isSelected = selectedItem?.name === item.name;
            const color = CATEGORY_COLORS[item.category] || '#025a9e';
            return (
              <CircleMarker
                key={`${item.category}-${item.placeId || item.name}-${idx}`}
                center={[item.lat, item.lng]}
                radius={isSelected ? 12 : 8}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 1,
                  color: '#ffffff',
                  weight: 2,
                }}
                eventHandlers={{ click: () => setSelectedItem(item) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'sans-serif', maxWidth: 200 }}>
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>{item.name}</strong>
                    {item.price && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.price}</div>}
                    <div style={{ fontSize: 11, color: '#025a9e', fontWeight: 700, marginTop: 4 }}>{ratingLabel(item)}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {filteredItems.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,250,252,0.88)', zIndex: 400, padding: 24, textAlign: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: 6 }}>No mapped locations for {destination}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hotels, restaurants and attractions from the trip will appear here once indexed.</div>
            </div>
          </div>
        )}

        {/* Overlay Badge */}
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 500, background: 'rgba(255,255,255,0.92)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, color: '#025a9e', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
          OpenStreetMap • Free Maps Engine
        </div>
      </div>

      {/* Interactive Location Chips Carousel */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Click Location to Focus on Map:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
          {filteredItems.map((item, idx) => {
            const isSelected = selectedItem?.name === item.name;
            const badgeColor = CATEGORY_COLORS[item.category] || '#025a9e';
            return (
              <div
                key={idx}
                onClick={() => handlePanTo(item)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${badgeColor}` : '1px solid #e2e8f0',
                  background: isSelected ? '#f0f9ff' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: badgeColor, background: '#fff', padding: '1px 6px', borderRadius: '4px', border: `1px solid ${badgeColor}30` }}>
                    {ratingLabel(item)}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.3' }}>
                  {item.desc || item.price || item.address}
                </div>
                {item.price && (
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#025a9e', marginTop: '2px' }}>
                    {item.price}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapView;
