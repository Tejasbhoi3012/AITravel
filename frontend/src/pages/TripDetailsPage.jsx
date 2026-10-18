import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import {
  Calendar,
  Users,
  BedDouble,
  Share2,
  Download,
  SlidersHorizontal,
  Zap,
  MoreVertical,
  MapPin,
  Sparkles,
} from 'lucide-react';

import HotelsSection from '../components/HotelsSection';
import RestaurantsSection from '../components/RestaurantsSection';
import PlacesSection from '../components/PlacesSection';
import ExpenseDashboard from '../components/ExpenseDashboard';
import MapView from '../components/MapView';
import AIChatDrawer from '../components/AIChatDrawer';
import AIBudgetOptimizerModal from '../components/AIBudgetOptimizerModal';

const TripDetailsPage = () => {
  const { id } = useParams();
  const { currentTrip, loadTrip } = useTrip();

  const [trip, setTrip] = useState(currentTrip);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  useEffect(() => {
    if (currentTrip) {
      setTrip(currentTrip);
      return;
    }
    if (!id || id.startsWith('trip_')) return;
    let cancelled = false;
    const fetchById = async () => {
      setLoading(true);
      try {
        const loaded = await loadTrip(id);
        if (!cancelled && loaded) setTrip(loaded);
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchById();
    return () => {
      cancelled = true;
    };
  }, [id, currentTrip, loadTrip]);

  const activeTrip = trip || currentTrip;

  if (loading) {
    return (
      <div className="page-loading-spinner">
        <div className="spinner"></div>
        <p>Loading trip details...</p>
      </div>
    );
  }

  const daysList = [
    { dayNum: 1, label: 'Day 1 • Arrival & Panjim' },
    { dayNum: 2, label: 'Day 2 • South Goa Coves' },
    { dayNum: 3, label: 'Day 3 • Spice Plantations' },
    { dayNum: 4, label: 'Day 4 • Aguada Sunset' },
    { dayNum: 5, label: 'Day 5 • Departure' },
  ];

  const daySequences = [
    'Day 1 Sequence — Mandovi & Old Quarter',
    'Day 2 Sequence — Palolem & Agonda Coves',
    'Day 3 Sequence — Spice Farms & Wildlife',
    'Day 4 Sequence — Forts & Sunset Points',
    'Day 5 Sequence — Markets & Departure',
  ];

  const day1Activities = [
    {
      time: '09:30 AM', category: 'TRANSIT HUB', badge: 'CONFIRMED', badgeClass: 'green',
      title: 'Flight Arrival at Dabolim Airport',
      desc: 'Pre-booked EV cab to Casa Sanctuary, Panjim. Driver contact: +91 98230 44102. Gate 3 pick-up bay.',
      meta: 'GOI-PNJ • 28 km',
      img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80',
    },
    {
      time: '12:00 PM', category: 'HOTEL CHECK-IN', badge: 'RESERVED', badgeClass: 'blue',
      title: 'Casa Sanctuary Boutique Villa',
      desc: 'Check-in, welcome kokum drink, freshen up. Heritage suite with balcony garden view. Booking ref: #CS-8921.',
      meta: 'Early Check-in Confirmed',
      img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80',
    },
    {
      time: '01:30 PM', category: 'GASTRONOMY', badge: 'MUST VISIT', badgeClass: 'gray',
      title: 'Lunch at Viva Panjim',
      desc: 'Traditional Goan fish curry, prawn balchão & vegetarian thali. Tucked in a 150-year-old home in Fontainhas.',
      meta: '★ 4.8 (1.2k reviews)', metaClass: 'green',
      img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
    },
    {
      time: '03:45 PM', category: 'HERITAGE WALK', badge: 'WALKING TOUR', badgeClass: 'gray',
      title: 'Fontainhas Latin Quarter Stroll',
      desc: 'Architectural walk through pastel Portuguese heritage villas, old bakeries, and St. Sebastian Chapel square.',
      meta: '2.1 km walk • 1h 45m',
      img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=200&q=80',
    },
    {
      time: '06:15 PM', category: 'SUNSET POINT', badge: 'GOLDEN HOUR', badgeClass: 'blue',
      title: 'Miramar Beach Golden Hour',
      desc: 'Sunset views over Mandovi River estuary where it enters the Arabian Sea. Gentle ocean breeze and fresh coconut water.',
      meta: 'Sunset @ 06:34 PM',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80',
    },
    {
      time: '08:30 PM', category: 'DINING', badge: 'TOP RATED', badgeClass: 'green',
      title: 'Dinner at Joseph Bar',
      desc: 'Feni cocktails and artisanal Goan tapas. Renowned for chilled craft beers, chorizo pao, and nostalgic retro vinyl records.',
      meta: 'Avg ₹1,200 for 2',
      img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'itinerary', label: 'Timeline Itinerary', dot: true },
    { key: 'map', label: 'Map View' },
    { key: 'hotels', label: 'Hotels', count: 5 },
    { key: 'restaurants', label: 'Restaurants', count: 8 },
    { key: 'places', label: 'Places', count: 12 },
    { key: 'expenses', label: 'Expenses' },
  ];

  return (
    <div className="workspace-root ws-v2">
      {/* Top breadcrumb bar */}
      <div className="ws-v2-topbar">
        <div className="ws-v2-crumb">
          <span>Trips</span><span className="sep">/</span><strong>Goa Summer Getaway</strong>
          <span className="sync-pill blue">● SYNCING LIVE</span>
          <span className="sync-pill green">◔ CONFIRMED BOOKING</span>
        </div>
        <div className="workspace-actions-group">
          <button className="btn-ws-primary blue-btn" onClick={() => setIsOptimizerOpen(true)}>
            <Zap size={14} /><span>AI Re-Optimize</span>
          </button>
          <button className="btn-ws-secondary" onClick={handleShare}>
            <Share2 size={14} /><span>{shareCopied ? 'Copied!' : 'Share'}</span>
          </button>
          <button className="btn-ws-secondary" onClick={() => window.print()}>
            <Download size={14} /><span>Download PDF</span>
          </button>
          <button className="btn-ws-secondary" onClick={() => setIsChatOpen(true)}>
            <SlidersHorizontal size={14} /><span>Edit Parameters</span>
          </button>
        </div>
      </div>

      {/* Title block */}
      <div className="ws-v2-titleblock">
        <div>
          <div className="ws-v2-terminal mono">AUTONOMOUS ITINERARY TERMINAL • V2.4</div>
          <h1 className="workspace-heading">Goa, India <span className="dot-sep">•</span> Coastal Breeze &amp; Heritage</h1>
        </div>
        <div className="ws-v2-meta">
          <div className="ws-v2-pills">
            <span className="ws-meta-pill"><Calendar size={13} /> 15 Sep - 20 Sep (5 Days)</span>
            <span className="ws-meta-pill"><Users size={13} /> 2 Travelers</span>
            <span className="ws-meta-pill"><BedDouble size={13} /> 3-Star Boutique Stays</span>
          </div>
          <span className="est-total-pill mono">Est. Total <strong>₹42,500</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ws-v2-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`ws-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.count && <span className="tab-count">{t.count}</span>}
            {t.dot && activeTab === t.key && <span className="tab-dot" />}
          </button>
        ))}
      </div>

      {activeTab === 'itinerary' && (
        <>
          {/* Day selector */}
          <div className="ws-v2-days">
            <div className="day-pills">
              {daysList.map((d, i) => (
                <button
                  key={d.dayNum}
                  className={`day-pill ${activeDayIndex === i ? 'active' : ''}`}
                  onClick={() => setActiveDayIndex(i)}
                >
                  {activeDayIndex === i && <span className="blue-dot" />}
                  {d.label}
                </button>
              ))}
            </div>
            <span className="nodes-note mono"><span className="green-dot" /> 6/6 NODES SCHEDULED • TOTAL TRANSIT: 1</span>
          </div>

          <div className="ws-v2-content">
            {/* Left timeline */}
            <div className="ws-v2-timeline">
              <div className="seq-head">
                <div>
                  <div className="seq-label">● CHRONOLOGICAL EXECUTION</div>
                  <h2>{daySequences[activeDayIndex]}</h2>
                </div>
                <div className="seq-actions">
                  <button className="insert-btn">+ Insert Waypoint</button>
                  <button className="filter-btn">☰</button>
                </div>
              </div>

              <div className="timeline-list">
                {day1Activities.map((a, idx) => (
                  <div key={idx} className="tl-item">
                    <span className={`tl-dot ${idx === 0 || idx === 4 ? 'ring' : ''}`} />
                    <div className="tl-card">
                      <img src={a.img} alt={a.title} className="tl-thumb" loading="lazy" />
                      <div className="tl-main">
                        <div className="tl-topline mono">
                          <strong>{a.time}</strong>
                          <span className="tl-sep">•</span>
                          <span>{a.category}</span>
                          <span className={`tl-badge ${a.badgeClass}`}>{a.badge}</span>
                        </div>
                        <h3>{a.title}</h3>
                        <p>{a.desc}</p>
                      </div>
                      <div className="tl-side">
                        <span className={`tl-meta mono ${a.metaClass || ''}`}>{a.meta}</span>
                        <MoreVertical size={14} color="#a1a1aa" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sync-foot">
                <span>◔ All reservations synced with Google Calendar &amp; Offline Wallet.</span>
                <button onClick={() => window.print()}>Download Passbook (.pkpass)</button>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="ws-v2-side">
              <div className="side-card">
                <div className="side-head mono">☀ MICRO-CLIMATE TELEMETRY <span className="live-radar">● LIVE RADAR</span></div>
                <div className="climate-grid">
                  <div><div className="big-temp">29°C</div><div className="climate-sub">Goa • Sunny &amp; Pleasant</div></div>
                  <div className="climate-right mono">
                    <div>Humidity: <strong>65%</strong></div>
                    <div>Precipitation: <span className="green">Low (5%)</span></div>
                    <div>Wind: <strong>12 km/h WSW</strong></div>
                  </div>
                </div>
              </div>

              <div className="side-card copilot-card">
                <div className="side-head mono blue">● TRAVELAI CO-PILOT SUGGESTION</div>
                <h4>Optimize Golden Hour Sequence</h4>
                <p>AI Assistant active. Want to swap Miramar Beach with a sunset river cruise? Saved <strong>₹400</strong> and reduced walking distance by 1.4 km.</p>
                {suggestionApplied ? (
                  <div className="applied-note">✓ Suggestion applied to Day {activeDayIndex + 1}</div>
                ) : (
                  <div className="copilot-btns">
                    <button className="apply-btn" onClick={() => setSuggestionApplied(true)}>Apply Suggestion</button>
                    <button className="dismiss-btn" onClick={() => setSuggestionApplied(false)}>Dismiss</button>
                  </div>
                )}
              </div>

              <div className="side-card">
                <div className="side-head mono">● LIVE BUDGET ENGINE <span className="budget-total mono">₹9,800 / ₹42,500</span></div>
                <div className="budget-bar"><div className="budget-fill" /></div>
                <div className="budget-row mono"><span className="blue">● 23% Utilized</span><span className="green">₹32,700 Remaining</span></div>
                <div className="budget-foot"><span>Day 1 Forecast: ₹4,150</span><button onClick={() => setActiveTab('expenses')}>View Ledger</button></div>
              </div>

              <div className="side-card">
                <div className="side-head mono">⛉ ROUTE TELEMETRY (DAY 1) <span className="wp-badge mono">6 WAYPOINTS</span></div>
                <div className="route-map">
                  <svg viewBox="0 0 300 110" className="route-svg">
                    <path d="M10,95 Q80,40 160,65 T250,30 T295,80" fill="none" stroke="#0b5cad" strokeWidth="2.5" strokeDasharray="5 4" />
                    <circle cx="10" cy="95" r="5" fill="#09090b" />
                    <circle cx="160" cy="65" r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
                    <circle cx="250" cy="30" r="6" fill="none" stroke="#0b5cad" strokeWidth="2.5" />
                    <circle cx="250" cy="30" r="2.5" fill="#0b5cad" />
                  </svg>
                  <div className="route-labels mono">
                    <span>◔ Panjim Coastal Strip</span>
                    <span className="gps">● Active GPS</span>
                  </div>
                </div>
                <button className="expand-map-btn" onClick={() => setActiveTab('map')}>↗ Expand Interactive Map</button>
              </div>

              <div className="side-card emergency-card">
                <span className="em-icon">◔</span>
                <div><strong>Emergency Support</strong><div className="mono em-sub">Goa Tourist Police: 112</div></div>
                <button className="mono" onClick={() => setIsChatOpen(true)}>Dial</button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'map' && (
        <MapView
          center={{ lat: activeTrip?.latitude || 15.2993, lng: activeTrip?.longitude || 74.124 }}
          destination={activeTrip?.destination || 'Goa, India'}
          hotels={activeTrip?.hotels || []}
          restaurants={activeTrip?.restaurants || []}
          places={activeTrip?.places || []}
        />
      )}
      {activeTab === 'hotels' && <HotelsSection hotels={activeTrip?.hotels || []} />}
      {activeTab === 'restaurants' && <RestaurantsSection restaurants={activeTrip?.restaurants || []} />}
      {activeTab === 'places' && <PlacesSection places={activeTrip?.places || []} />}
      {activeTab === 'expenses' && (
        <ExpenseDashboard
          expenses={activeTrip?.expenses || {}}
          budget={activeTrip?.budget || 42500}
          currency={activeTrip?.currency || 'INR'}
          travelers={activeTrip?.travelers || { count: 2 }}
          onOpenAIOptimizer={() => setIsOptimizerOpen(true)}
        />
      )}
      {activeTab === 'overview' && (
        <div className="ov-wrap">
          <div className="ov-hero">
            <div>
              <div className="mono ov-label">● TRIP OVERVIEW &amp; SUMMARY</div>
              <h3>5-Day Curated Journey in Goa</h3>
              <p>
                5-Day curated journey in Goa covering North coastal resorts, historic Portuguese
                forts, vibrant local spice plantations, and serene sunset beaches.
              </p>
              <div className="ov-facts">
                <span className="ov-fact mono"><Calendar size={12} /> 15 – 20 Sep • 5 Days</span>
                <span className="ov-fact mono"><Users size={12} /> 2 Travelers</span>
                <span className="ov-fact mono"><BedDouble size={12} /> 3-Star Boutique</span>
                <span className="ov-fact mono">₹ Est. ₹42,500 Total</span>
              </div>
              <button className="btn-ws-primary blue-btn" style={{ marginTop: 14 }} onClick={() => setActiveTab('itinerary')}>
                <MapPin size={13} /> View Timeline
              </button>
            </div>
            <div className="ov-route">
              <div className="mono ov-route-head">ROUTE SNAPSHOT • GOA-IND-5D</div>
              <div className="ov-route-row"><span>Day 1–2</span><strong>North Coast • Panjim &amp; Baga</strong></div>
              <div className="ov-route-row"><span>Day 3</span><strong>Spice Plantations &amp; Old Goa</strong></div>
              <div className="ov-route-row"><span>Day 4–5</span><strong>South Coves • Palolem &amp; Departure</strong></div>
              <div className="ov-status mono"><span className="green-dot" /> SYNCED • Google Calendar + Offline Wallet</div>
            </div>
          </div>
        </div>
      )}

      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        trip={{
          destination: activeTrip?.destination || 'Goa, India',
          duration: activeTrip?.duration || 5,
          budget: activeTrip?.budget || 42500,
          currency: activeTrip?.currency || 'INR',
          travelers: activeTrip?.travelers || { count: 2, type: 'Couple' },
        }}
      />

      <AIBudgetOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        trip={{
          destination: activeTrip?.destination || 'Goa, India',
          duration: activeTrip?.duration || 5,
          budget: activeTrip?.budget || 42500,
          currency: activeTrip?.currency || 'INR',
          travelers: activeTrip?.travelers || { count: 2, type: 'Couple' },
        }}
      />
      <button
        onClick={() => setIsChatOpen(true)}
        style={{ position: 'fixed', bottom: 22, right: 22, background: '#0b5cad', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 18px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', boxShadow: '0 6px 20px rgba(11,92,173,0.4)', zIndex: 60 }}
      >
        <Sparkles size={14} /> Ask TravelAI
      </button>
    </div>
  );
};

export default TripDetailsPage;
