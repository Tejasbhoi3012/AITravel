import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as tripService from '../services/tripService';
import { MapPin, Calendar, Zap, Share2, Download, LayoutGrid } from 'lucide-react';
import ItinerarySection from '../components/ItinerarySection';
import HotelsSection from '../components/HotelsSection';
import RestaurantsSection from '../components/RestaurantsSection';
import ExpenseDashboard from '../components/ExpenseDashboard';
import MapView from '../components/MapView';

const feedEntries = [
  {
    time: '09:30 AM', cat: 'LODGING', note: 'Estimated 45 min transit', price: '₹14,500',
    title: 'Arrival & Coastal Check-in at Ahilya by the Sea',
    desc: 'Private waterfront estate overlooking Dolphin Bay. Precision check-in via autonomous concierge with sea-breeze welcome infusion.',
    chips: ['Nerul Bay', 'Luggage Forwarded', 'Booking Confirmed #AH-8291'],
    highlight: 2,
  },
  {
    time: '01:15 PM', cat: 'DINING', note: "Chef's Curated Table", price: '₹3,400',
    title: 'Artisanal Goan Lunch at Cavatina Cuchina',
    desc: 'Chef Avinash Martins reinterprets coastal heritage cuisine with wild mud crab, cold-pressed feni vinegar, and cured chorizo reduction.',
    chips: ['Table #04 Verified', 'Tasting Menu Locked', '★ 4.9 Zagat Score'],
    highlight: 2,
  },
  {
    time: '04:45 PM', cat: 'EXPLORE', note: 'Guided Architectural Walk', price: 'Free',
    title: 'Fontainhas Heritage Latin Quarter Walk',
    desc: 'Immersive walking corridor through century-old pastel residences, traditional azulejos ceramic tile markers, and St. Sebastian Chapel square.',
    chips: ['GPS Node: 15.4989° N', 'Low Heat Index', 'Historic Marker #29'],
    highlight: -1,
  },
];

const SharedTripPage = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [activeDay, setActiveDay] = useState(1);
  const [expandedAll, setExpandedAll] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const data = await tripService.getSharedTrip(token);
        if (data.success && data.trip) {
          setTrip(data.trip);
        }
      } catch (err) {
        console.warn('Failed to fetch shared trip:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [token]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="page-loading-spinner">
        <div className="spinner"></div>
        <p>Loading shared itinerary...</p>
      </div>
    );
  }

  const days = [1, 2, 3, 4, 5];

  return (
    <div className="shared-feed-root">
      {/* Route header */}
      <div className="shared-route-row">
        <span className="shared-route-pill mono">● ROUTE-SYNTH-V4 • GOA-IND-5D • TELEMETRY ACTIVE</span>
        <span className="shared-sha mono">◈ SHA-256: 8f4a9b2c...a49d</span>
      </div>

      <div className="shared-title">Goa Coastal Expedition // Live Workspace</div>

      <div className="shared-pills-row">
        <span className="shared-pill mono"><Calendar size={12} /> 5 DAYS / 4 NIGHTS</span>
        <span className="shared-pill mono">₹ INR ₹42,500 BUDGET</span>
        <span className="shared-pill green mono">◔ STATUS: LOCKED &amp; AUDITED</span>
        <div className="shared-actions">
          <button onClick={() => setActiveTab('expenses')}><Zap size={13} /> AI Re-Optimize</button>
          <button onClick={handleShare}><Share2 size={13} /> {copied ? 'Copied!' : 'Share Link'}</button>
        </div>
      </div>
      <div className="shared-pills-row" style={{ marginTop: 8 }}>
        <span className="shared-pill mono">☀ WEATHER: 29°C SUNNY</span>
        <div className="shared-actions">
          <button onClick={() => window.print()}><Download size={13} /> Audit PDF</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="shared-tabs-bar">
        {[
          { k: 'overview', label: 'Overview' },
          { k: 'itinerary', label: 'Timeline Itinerary' },
          { k: 'map', label: 'Map View' },
          { k: 'hotels', label: 'Hotels', count: trip?.hotels?.length || 5 },
          { k: 'restaurants', label: 'Restaurants', count: trip?.restaurants?.length || 8 },
          { k: 'places', label: 'Places', count: trip?.places?.length || 12 },
          { k: 'expenses', label: 'Expenses', money: '₹42.5k' },
        ].map((t) => (
          <button
            key={t.k}
            className={`shared-tab ${activeTab === t.k ? 'active' : ''}`}
            onClick={() => setActiveTab(t.k)}
          >
            {t.label}
            {t.count && <span className="count-badge">{t.count}</span>}
            {t.money && <span className="money-badge">{t.money}</span>}
          </button>
        ))}
        <button className="expand-panels" onClick={() => setExpandedAll(!expandedAll)}>
          <LayoutGrid size={13} /> {expandedAll ? 'Collapse Panels' : 'Expand All Panels'}
        </button>
      </div>

      {/* Days */}
      <div className="shared-days-bar">
        {days.map((d) => (
          <button key={d} className={`shared-day ${activeDay === d ? 'active' : ''}`} onClick={() => setActiveDay(d)}>
            Day {String(d).padStart(2, '0')}
          </button>
        ))}
        <button className="insert-wp" onClick={() => setActiveTab('itinerary')}>+ Insert Waypoint</button>
      </div>

      {/* Feed (itinerary/overview default view) */}
      {(activeTab === 'itinerary' || activeTab === 'overview' || expandedAll) && (
        <div className="feed-list">
          {feedEntries.map((f, i) => (
            <div key={i} className="feed-item">
              <div className="feed-rail"><span className="feed-ring" /></div>
              <div className="feed-card">
                <div className="feed-topline">
                  <time>{f.time}</time>
                  <span className="feed-cat">{f.cat}</span>
                  <span className="feed-transit">{f.note}</span>
                  <span className="feed-price">{f.price}</span>
                </div>
                <div className="feed-title">{f.title}<MapPin size={13} className="feed-pin" /></div>
                <p className="feed-desc">{f.desc}</p>
                <div className="feed-chips">
                  {f.chips.map((c, ci) => (
                    <span key={ci} className={ci === f.highlight ? 'feed-chip-green' : ''}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real trip data tabs */}
      {trip && !expandedAll && (
        <div style={{ marginTop: 18 }}>
          {activeTab === 'itinerary' && null}
          {activeTab === 'overview' && null}
          {activeTab === 'hotels' && <HotelsSection hotels={trip.hotels || []} />}
          {activeTab === 'restaurants' && <RestaurantsSection restaurants={trip.restaurants || []} />}
          {activeTab === 'expenses' && <ExpenseDashboard expenses={trip.expenses || {}} budget={trip.budget} currency={trip.currency} travelers={trip.travelers} />}
          {activeTab === 'map' && <MapView center={{ lat: trip.latitude, lng: trip.longitude }} destination={trip.destination} hotels={trip.hotels} restaurants={trip.restaurants} places={trip.places} />}
        </div>
      )}
      {!trip && activeTab !== 'itinerary' && activeTab !== 'overview' && (
        <div style={{ marginTop: 18, background: '#fff', border: '1px solid #e9e9ee', borderRadius: 14, padding: 22, fontSize: '0.85rem', color: '#52525b' }}>
          {activeTab === 'map' && 'Interactive map loads with the live shared trip link.'}
          {activeTab === 'hotels' && <ItinerarySection itinerary={[]} currency="INR" />}
          {activeTab === 'restaurants' && 'Restaurant shortlist syncs with the live shared trip link.'}
          {activeTab === 'expenses' && 'Audited expense ledger syncs with the live shared trip link.'}
          {activeTab === 'places' && 'Place markers sync with the live shared trip link.'}
        </div>
      )}

      {/* Design system spec */}
      <div className="spec-card">
        <div className="spec-head">
          <span>✂ DESIGN SYSTEM SPECIFICATION // TABS &amp; MOTION TOKENS</span>
          <span>TravelAI Component Library v2.0.4</span>
        </div>
        <div className="spec-grid">
          <div>
            <h5>DEFAULT TAB STATE <span>Overview</span></h5>
            <p>Transparent surface, color on-surface-variant, hover shifts to surface-container-high.</p>
          </div>
          <div>
            <h5>HOVER STATE <span>Timeline Itinerary</span></h5>
            <p>150ms ease-out background elevation with primary color text contrast.</p>
          </div>
          <div>
            <h5>ACTIVE LOCKED STATE <span>Hotels 5</span></h5>
            <p>Rich primary fill with active telemetry beacon dot.</p>
          </div>
        </div>
        <div className="spec-foot">
          <span>Hover Duration: 150ms ease-out</span>
          <span>Tab Switch: 220ms slide-up &amp; fade</span>
          <span>Pulse Radar: 1.6s infinite loop</span>
          <span>Focus State: 2px #0B5CAD ring</span>
        </div>
      </div>

      {!trip && (
        <div style={{ marginTop: 16, fontSize: '0.78rem', color: '#71717a' }}>
          Live data unavailable for this preview — <Link to="/" style={{ color: '#0b5cad', fontWeight: 700 }}>Go to TravelAI Home</Link>
        </div>
      )}
    </div>
  );
};

export default SharedTripPage;
