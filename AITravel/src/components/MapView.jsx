import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Building, Utensils, Compass, ExternalLink, Layers, Eye } from 'lucide-react';

const MapView = ({
  center = { lat: 15.2993, lng: 74.124 },
  destination = 'Goa, India',
  hotels = [],
  restaurants = [],
  places = [],
  focusedLocation = null,
}) => {
  const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const defaultHotels = hotels.length > 0 ? hotels : [
    { name: 'Casa De Goa Boutique Resort', lat: 15.5435, lng: 73.7554, type: 'hotel', rating: 4.6, price: '₹4,500/night', desc: 'Portuguese style luxury resort near Calangute beach' },
    { name: 'Taj Fort Aguada Resort & Spa', lat: 15.4989, lng: 73.7667, type: 'hotel', rating: 4.8, price: '₹12,000/night', desc: '5-star cliffside luxury overlooking Sinquerim beach' },
    { name: 'W Goa Beach Resort', lat: 15.6022, lng: 73.7388, type: 'hotel', rating: 4.7, price: '₹14,500/night', desc: 'Vagator beachfront modern luxury resort' },
  ];

  const defaultRestaurants = restaurants.length > 0 ? restaurants : [
    { name: 'Navtara Pure Veg Coastal Diner', lat: 15.5412, lng: 73.7589, type: 'restaurant', rating: 4.5, price: '₹600 for two', desc: 'Authentic Goan vegetarian thali & coastal dosas' },
    { name: "Souza Lobo & Tito's Lane", lat: 15.5398, lng: 73.7512, type: 'restaurant', rating: 4.6, price: '₹1,400 for two', desc: 'Iconic beachside seafood & Goan curries with live music' },
    { name: 'Gunpowder Assagao', lat: 15.5891, lng: 73.7745, type: 'restaurant', rating: 4.7, price: '₹1,200 for two', desc: 'South Indian coastal specialty in a heritage garden villa' },
  ];

  const defaultPlaces = places.length > 0 ? places : [
    { name: 'Fort Aguada & Lighthouse', lat: 15.4925, lng: 73.7736, type: 'place', rating: 4.7, price: '₹50 entry', desc: '17th-century Portuguese coastal fortress and sunset lookout' },
    { name: 'Baga & Calangute Beach Strip', lat: 15.5524, lng: 73.7517, type: 'place', rating: 4.5, price: 'Free access', desc: 'Lively golden sands, shacks, and exhilarating watersports' },
    { name: 'Chapora Fort (Dil Chahta Hai)', lat: 15.6058, lng: 73.7369, type: 'place', rating: 4.6, price: 'Free access', desc: 'Panoramic hilltop fortress overlooking Vagator and Ozran' },
    { name: 'Basilica of Bom Jesus (Old Goa)', lat: 15.5009, lng: 73.9116, type: 'place', rating: 4.8, price: 'Free access', desc: 'UNESCO World Heritage site with baroque Portuguese architecture' },
  ];

  const allItems = [
    ...defaultHotels.map(h => ({ ...h, category: 'hotel' })),
    ...defaultRestaurants.map(r => ({ ...r, category: 'restaurant' })),
    ...defaultPlaces.map(p => ({ ...p, category: 'place' })),
  ];

  const filteredItems = activeCategory === 'all'
    ? allItems
    : allItems.filter(item => item.category === activeCategory);

  const activeLat = focusedLocation?.lat || center?.lat || 15.2993;
  const activeLng = focusedLocation?.lng || center?.lng || 74.124;

  // Load Google Maps JS script
  useEffect(() => {
    if (!mapApiKey) return;

    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const existingScript = document.getElementById('google-maps-js-sdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-js-sdk';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => {
        console.warn('Google Maps script failed to load. Using fallback view.');
        setMapLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', initMap);
    }

    function initMap() {
      if (!mapRef.current || !window.google) return;

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: activeLat, lng: activeLng },
          zoom: 11,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cbe7f7' }] },
          ],
        });

        googleMapInstance.current = map;
        infoWindowRef.current = new window.google.maps.InfoWindow();
        setMapLoaded(true);
      } catch (err) {
        console.warn('Could not initialize Google Map JS:', err);
      }
    }
  }, [mapApiKey, activeLat, activeLng]);

  // Update Markers on filter change
  useEffect(() => {
    if (!googleMapInstance.current || !window.google) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    filteredItems.forEach((item) => {
      if (!item.lat || !item.lng) return;

      const position = { lat: item.lat, lng: item.lng };
      bounds.extend(position);

      const color = item.category === 'hotel' ? '#025a9e' : item.category === 'restaurant' ? '#d97706' : '#059669';

      const marker = new window.google.maps.Marker({
        position,
        map: googleMapInstance.current,
        title: item.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });

      marker.addListener('click', () => {
        setSelectedItem(item);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 6px 8px; font-family: sans-serif; max-width: 200px;">
              <strong style="font-size: 13px; color: #0f172a;">${item.name}</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.price || ''}</div>
              <div style="font-size: 11px; color: #025a9e; font-weight: 700; margin-top: 4px;">★ ${item.rating || '4.5'}</div>
            </div>
          `);
          infoWindowRef.current.open(googleMapInstance.current, marker);
        }
      });

      markersRef.current.push(marker);
    });

    if (filteredItems.length > 0) {
      googleMapInstance.current.fitBounds(bounds);
    }
  }, [filteredItems, mapLoaded]);

  const handlePanTo = (item) => {
    setSelectedItem(item);
    if (googleMapInstance.current && item.lat && item.lng) {
      googleMapInstance.current.panTo({ lat: item.lat, lng: item.lng });
      googleMapInstance.current.setZoom(14);
    }
  };

  const embedFallbackUrl = `https://maps.google.com/maps?q=${activeLat},${activeLng}&hl=en&z=12&output=embed`;

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
            Exploring <strong>{destination}</strong> ({activeLat.toFixed(4)}, {activeLng.toFixed(4)}) • {filteredItems.length} locations mapped
          </p>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeCategory === 'all' ? '#025a9e' : '#f1f5f9',
              color: activeCategory === 'all' ? '#fff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            All Pins ({allItems.length})
          </button>
          <button
            onClick={() => setActiveCategory('hotel')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeCategory === 'hotel' ? '#025a9e' : '#f1f5f9',
              color: activeCategory === 'hotel' ? '#fff' : '#475569',
            }}
          >
            🏨 Stays ({defaultHotels.length})
          </button>
          <button
            onClick={() => setActiveCategory('restaurant')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeCategory === 'restaurant' ? '#d97706' : '#f1f5f9',
              color: activeCategory === 'restaurant' ? '#fff' : '#475569',
            }}
          >
            🍽️ Dining ({defaultRestaurants.length})
          </button>
          <button
            onClick={() => setActiveCategory('place')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeCategory === 'place' ? '#059669' : '#f1f5f9',
              color: activeCategory === 'place' ? '#fff' : '#475569',
            }}
          >
            📍 Attractions ({defaultPlaces.length})
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div style={{ position: 'relative', width: '100%', height: '480px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        {mapApiKey && (
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '100%',
              display: mapLoaded ? 'block' : 'none',
            }}
          />
        )}

        {/* Fallback Embed View if JS API isn't yet ready */}
        {(!mapLoaded || !mapApiKey) && (
          <iframe
            title="Google Map View"
            src={embedFallbackUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}

        {/* Overlay Badge */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, color: '#025a9e', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
          Google Maps Live Engine
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
            const badgeColor = item.category === 'hotel' ? '#025a9e' : item.category === 'restaurant' ? '#d97706' : '#059669';
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
                    ★ {item.rating || '4.6'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.3' }}>
                  {item.desc || item.price}
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
