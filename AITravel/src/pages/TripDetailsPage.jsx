import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Share2,
  Sparkles,
  Building,
  FileText,
  Edit3,
  Sun,
  Clock,
  ExternalLink,
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

  // Sync with context + fetch by id when landing directly on /trip/:id
  useEffect(() => {
    if (currentTrip) {
      setTrip(currentTrip);
      return;
    }
    // Skip client-side fallback ids (trip_<timestamp>) — nothing to fetch
    if (!id || id.startsWith('trip_')) return;
    let cancelled = false;
    const fetchById = async () => {
      setLoading(true);
      try {
        const loaded = await loadTrip(id);
        if (!cancelled && loaded) setTrip(loaded);
      } catch {
        // Keep hardcoded demo fallback below
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

  // Day list
  const daysList = [
    { dayNum: 1, dayName: 'Day 1 • TUE', date: '15 Sep', title: 'Arrival & North' },
    { dayNum: 2, dayName: 'Day 2 • WED', date: '16 Sep', title: 'Forts & Spices' },
    { dayNum: 3, dayName: 'Day 3 • THU', date: '17 Sep', title: 'Island & Watersports' },
    { dayNum: 4, dayName: 'Day 4 • FRI', date: '18 Sep', title: 'South Heritage' },
    { dayNum: 5, dayName: 'Day 5 • SAT', date: '19 Sep', title: 'Sunset Souvenirs' },
  ];

  // Detailed day 1 schedule matching Screenshot 2
  const day1Activities = [
    {
      time: '09:00 AM',
      categoryTag: 'TRANSIT & TRANSFER',
      statusBadge: 'Confirmed',
      title: 'Flight Arrival at Dabolim Airport (GOI)',
      desc: 'Private airport pickup arranged via AC Sedan. Smooth 45-minute coastal highway route straight to Calangute resort.',
      chips: ['Sedan #GA-03-E-8821', '45 mins drive', 'Prepaid (Transport Pool)'],
      icon: 'car',
    },
    {
      time: '10:30 AM',
      categoryTag: 'STAY CHECK-IN',
      statusBadge: '★ 4.6 (520 reviews)',
      title: 'Casa De Goa Boutique Resort',
      desc: 'Calangute beachside haven with Portuguese-influenced architecture, lush tropical gardens, and serene outdoor pool.',
      chips: ['🏊 Swimming Pool', '🥥 Fresh Coconut Welcome', '📶 High Speed Wi-Fi'],
      bookingRef: 'Booking ref: TAI-GOA-99201',
      hasButtons: true,
      img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80',
    },
    {
      time: '12:30 PM',
      categoryTag: 'COASTAL DINING',
      statusBadge: 'AI Recommended for Vegetarian',
      title: 'Navtara Pure Veg Coastal Diner',
      desc: 'Authentic Goan vegetarian thali, sol kadhi, crisp neer dosas, and fresh tender coconut kheer in a cool, shaded setting.',
      chips: ['★ 4.5', 'Avg ₹600 for two', '400m walk from resort'],
    },
    {
      time: '02:30 PM',
      categoryTag: 'COASTAL ADVENTURE',
      statusBadge: 'FREE ACCESS',
      title: 'Relax & Water Activities at Baga Beach',
      desc: 'Golden sand coastline walks, lively shacks, and exhilarating beach watersports with verified coastal operators.',
      chips: ['Parasailing & Jet Ski ~₹1,200 per pax', 'Vibe: Lively & Sun-drenched', 'Peak Timing: 2:30 PM - 4:45 PM'],
      hasActionChips: true,
    },
    {
      time: '05:45 PM',
      categoryTag: 'SIGHTSEEING & SUNSET',
      statusBadge: 'Must-visit for Twilight Photos',
      title: 'Fort Aguada Lighthouse & Sunset Point',
      desc: 'Historic 17th-century Portuguese fortress perched on Sinquerim cliff overlooking the endless Arabian Sea waves. Unmatched sunset vantage.',
      chips: ['★ 4.7', 'Entry: ₹50 / person', 'Lighthouse Closes 6:00 PM'],
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
    {
      time: '08:30 PM',
      categoryTag: 'DINNER & EVENING LEISURE',
      statusBadge: 'Reservation Recommended',
      title: "Dinner & Live Music at Souza Lobo & Tito's Lane",
      desc: "Beachside candlelit table with ocean breeze, soothing live acoustic Goan songs, followed by a stroll down iconic Tito's Lane.",
      chips: ['Avg ₹1,400 for two', 'Seafood & Coastal Cocktails', 'Live Music from 9:00 PM'],
    },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  return (
    <div className="workspace-root">
      {/* Top Breadcrumb & Live Sync */}
      <div className="workspace-top-bar">
        <span>Trips &gt; Goa Summer Getaway 2026</span>
        <div className="workspace-sync-badges">
          <span className="sync-badge-live">● SYNCING LIVE</span>
          <span className="sync-badge-confirmed">✔ Confirmed Booking</span>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#025a9e', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
        SMART ITINERARY WORKSPACE
      </div>

      {/* Main Title & Action Buttons */}
      <div className="workspace-title-row">
        <h1 className="workspace-heading">
          Goa, India • <span>Coastal Breeze &amp; Heritage</span>
        </h1>

        <div className="workspace-actions-group">
          <button className="btn-ws-primary" onClick={() => setIsOptimizerOpen(true)}>
            <Sparkles size={14} />
            <span>AI Re-Optimize</span>
          </button>
          <button className="btn-ws-secondary" onClick={handleShare}>
            <Share2 size={14} />
            <span>{shareCopied ? 'Copied!' : 'Share'}</span>
          </button>
          <button className="btn-ws-secondary" onClick={() => window.print()}>
            <FileText size={14} />
            <span>PDF</span>
          </button>
          <button className="btn-ws-secondary" title="Edit trip title">
            <Edit3 size={14} />
          </button>
        </div>
      </div>

      {/* Meta Pills Row */}
      <div className="workspace-meta-pills-row">
        <span className="ws-meta-pill">
          <Calendar size={13} color="#025a9e" />
          15 Sep – 20 Sep 2026 (5 Days)
        </span>
        <span className="ws-meta-pill">
          <Users size={13} color="#025a9e" />
          2 Travelers
        </span>
        <span className="ws-meta-pill">
          <Building size={13} color="#025a9e" />
          3-Star Boutique
        </span>
        <span className="ws-meta-pill">
          <IndianRupee size={13} color="#025a9e" />
          ₹42,500 Total Budget
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="workspace-nav-tabs">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'itinerary', label: 'Timeline Itinerary' },
          { key: 'map', label: 'Interactive Map' },
          { key: 'hotels', label: 'Hotels (5)' },
          { key: 'restaurants', label: 'Restaurants (8)' },
          { key: 'places', label: 'Places to Visit (12)' },
          { key: 'expenses', label: 'Expenses & Budget' },
        ].map((t) => (
          <button
            key={t.key}
            className={`ws-tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===================================================================
          TAB 1: TIMELINE ITINERARY
          =================================================================== */}
      {activeTab === 'itinerary' && (
        <div>
          {/* Day Selector Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Select Travel Day</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>5-DAY CURATED ROUTE</span>
          </div>

          <div className="day-selector-carousel">
            {daysList.map((d, index) => (
              <div
                key={d.dayNum}
                className={`day-chip-card ${activeDayIndex === index ? 'active' : ''}`}
                onClick={() => setActiveDayIndex(index)}
              >
                <div className="day-chip-title">{d.dayName}</div>
                <div className="day-chip-date">{d.date}</div>
                <div className="day-chip-sub">{d.title}</div>
              </div>
            ))}
          </div>

          {/* 2-Column Content Layout */}
          <div className="workspace-content-2col">
            {/* Left Column: Day 1 Timeline Activities */}
            <div>
              <div className="day-banner-header">
                <div className="day-banner-left">
                  <div className="day-num-box-blue">1D</div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                      Day 1: Arrival, Settling In &amp; Sunset Vibes
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Calangute &amp; Baga belt • 28 km total driving distance
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#025a9e' }}>
                  Tempo: Relaxed
                </span>
              </div>

              {/* Activity Cards List */}
              <div className="timeline-vertical-flow">
                {day1Activities.map((act, idx) => (
                  <div key={idx} className="activity-card-detailed">
                    <div className="act-badge-time-row">
                      <span className="act-time-pill">
                        <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {act.time} • {act.categoryTag}
                      </span>
                      <span className="act-status-badge-blue">{act.statusBadge}</span>
                    </div>

                    <div className={act.img ? 'act-photo-preview-wrap' : ''}>
                      <div style={{ flex: 1 }}>
                        <h3 className="act-title-huge">{act.title}</h3>
                        <p className="act-desc-text">{act.desc}</p>

                        <div className="act-chips-row">
                          {act.chips.map((chip, cIdx) => (
                            <span key={cIdx} className="act-mini-chip">{chip}</span>
                          ))}
                        </div>

                        {act.bookingRef && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                              {act.bookingRef}
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn-ws-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                                View Voucher
                              </button>
                              <button className="btn-ws-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                                Directions
                              </button>
                            </div>
                          </div>
                        )}

                        {act.hasActionChips && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            <button className="btn-ws-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                              <MapPin size={11} /> View on Map
                            </button>
                            <button className="btn-ws-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                              <Sparkles size={11} /> Tips &amp; Best Time
                            </button>
                          </div>
                        )}
                      </div>

                      {act.img && (
                        <img src={act.img} alt={act.title} className="act-thumb-img" />
                      )}
                    </div>
                  </div>
                ))}

                <button className="btn-add-activity-dashed">
                  ⊕ Add Custom Activity or Reservation to Day 1
                </button>
              </div>
            </div>

            {/* Right Column: Sticky Sidebar Widgets */}
            <div className="workspace-sidebar">
              {/* Widget 1: Weather Forecast */}
              <div className="side-weather-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
                    ☀️ Trip Weather Forecast
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>GOA COASTAL</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0' }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>29°C</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sunny with coastal breeze</div>
                  </div>
                  <Sun size={38} color="#f59e0b" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center', background: '#f8fafc', padding: 8, borderRadius: 6, fontSize: '0.7rem' }}>
                  <div>
                    <div style={{ color: '#94a3b8' }}>Humidity</div>
                    <div style={{ fontWeight: 800 }}>66%</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>Wind</div>
                    <div style={{ fontWeight: 800 }}>14 km/h</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>UV Index</div>
                    <div style={{ fontWeight: 800 }}>Moderate (5)</div>
                  </div>
                </div>
              </div>

              {/* Widget 2: AI Co-Pilot Swap */}
              <div className="side-copilot-card">
                <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 4 }}>
                  ⚡ AI CO-PILOT
                </div>
                <h4>Need to swap an activity?</h4>
                <p>
                  Click here or ask TravelAI. We can recalculate drive times, switch beach spots, or find rain backup options instantly.
                </p>
                <button className="btn-open-copilot-white" onClick={() => setIsChatOpen(true)}>
                  💬 Open Co-Pilot Workspace
                </button>
              </div>

              {/* Widget 3: Budget Meter */}
              <div className="side-budget-meter-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Budget Meter</span>
                  <span style={{ fontSize: '0.68rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>Day 1 of 5</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #025a9e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                    23%
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>₹9,800 spent</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>of ₹42,600 total estimated • ₹32,700 remaining</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Stay &amp; Resort</span>
                    <strong>₹6,200 / ₹22,000</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Food &amp; Drinks</span>
                    <strong>₹2,600 / ₹11,100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Transfers &amp; Activities</span>
                    <strong>₹1,000 / ₹9,500</strong>
                  </div>
                </div>
              </div>

              {/* Widget 4: Day 1 Route Map Preview */}
              <div className="side-map-card">
                <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Day 1 Route Map</span>
                  <ExternalLink size={12} color="#025a9e" />
                </div>
                <iframe
                  title="Goa Map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${74.124 - 0.2}%2C${15.2993 - 0.12}%2C${74.124 + 0.2}%2C${15.2993 + 0.12}&layer=mapnik&marker=15.2993%2C74.124`}
                  width="100%"
                  height="160"
                  style={{ border: 0 }}
                  loading="lazy"
                />
                <div style={{ padding: '6px 12px', fontSize: '0.68rem', color: '#025a9e', fontWeight: 700, background: '#f0f9ff' }}>
                  ● 6 Live Footages Active
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MAP VIEW */}
      {activeTab === 'map' && (
        <MapView
          center={{ lat: activeTrip?.latitude || 15.2993, lng: activeTrip?.longitude || 74.124 }}
          destination={activeTrip?.destination || 'Goa, India'}
          hotels={activeTrip?.hotels || []}
          restaurants={activeTrip?.restaurants || []}
          places={activeTrip?.places || []}
        />
      )}

      {/* TAB 3: HOTELS */}
      {activeTab === 'hotels' && <HotelsSection hotels={activeTrip?.hotels || []} />}

      {/* TAB 4: RESTAURANTS */}
      {activeTab === 'restaurants' && <RestaurantsSection restaurants={activeTrip?.restaurants || []} />}

      {/* TAB 5: PLACES */}
      {activeTab === 'places' && <PlacesSection places={activeTrip?.places || []} />}

      {/* TAB 6: EXPENSES */}
      {activeTab === 'expenses' && (
        <ExpenseDashboard
          expenses={activeTrip?.expenses || {}}
          budget={activeTrip?.budget || 42500}
          currency={activeTrip?.currency || 'INR'}
          travelers={activeTrip?.travelers || { count: 2 }}
          onOpenAIOptimizer={() => setIsOptimizerOpen(true)}
        />
      )}

      {/* TAB 7: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 12 }}>
          <h3>Trip Overview &amp; Summary</h3>
          <p style={{ marginTop: 8, color: '#64748b' }}>
            5-Day curated journey in Goa covering North coastal resorts, historic Portuguese forts, vibrant local spice plantations, and serene sunset beaches.
          </p>
        </div>
      )}

      {/* Floating AI Chat Assistant Drawer */}
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

      {/* AI Budget Optimizer Modal */}
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
    </div>
  );
};

export default TripDetailsPage;
