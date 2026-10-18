import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import AIChatDrawer from '../components/AIChatDrawer';
import AIBudgetOptimizerModal from '../components/AIBudgetOptimizerModal';

// Leaflet is heavy — only loaded when the map tab is actually opened.
const MapView = lazy(() => import('../components/MapView'));

const ACTIVITY_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=200&q=80';
const ACTIVITY_IMAGE_RULES = [
  { match: /din|food|restaurant|cafe|cuisine|meal|brunch/, img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80' },
  { match: /hotel|check-?in|resort|stay|suite|villa/, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80' },
  { match: /transit|airport|flight|arrival|transfer|train|departure/, img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80' },
  { match: /beach|sunset|coast|harbor|sea|ocean|water|lake/, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80' },
  { match: /nature|garden|park|forest|waterfall|hill|wildlife/, img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=80' },
  { match: /museum|heritage|culture|temple|fort|historic|gallery|art|architecture/, img: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=200&q=80' },
];

const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    const currentId = currentTrip ? String(currentTrip._id || currentTrip.tripId || currentTrip.id || '') : '';
    if (currentTrip && (!id || currentId === id)) {
      setTrip(currentTrip);
      setLoading(false);
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

  if (!activeTrip) {
    return (
      <div className="workspace-root ws-v2">
        <div style={{ maxWidth: 460, margin: '90px auto', padding: '36px 28px', border: '1px solid #e4e4e7', borderRadius: 16, background: '#fff', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '0.72rem', color: '#71717a', letterSpacing: '0.08em', marginBottom: 10 }}>● TRIP UNAVAILABLE</div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#18181b', marginBottom: 8 }}>We couldn&apos;t load this trip</h3>
          <p style={{ fontSize: '0.84rem', color: '#52525b', lineHeight: 1.6, marginBottom: 18 }}>It may have been removed, or it&apos;s still generating. Head back to My Trips to try again.</p>
          <button className="btn-ws-primary blue-btn" onClick={() => navigate('/my-trips')}>Back to My Trips</button>
        </div>
      </div>
    );
  }

  const destination = activeTrip.destination || 'Your Trip';
  const country = activeTrip.country || '';
  const duration = Number(activeTrip.duration) || 3;
  const travelersCount = Number(activeTrip.travelers?.count) || 1;
  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'AED ' };
  const currencySymbol = currencySymbols[activeTrip.currency] || '';
  const money = (amount) => `${currencySymbol}${Number(amount || 0).toLocaleString('en-IN')}`;
  const budget = Number(activeTrip.budget) || 0;
  const expenses = activeTrip.expenses || {};
  const spent = Number(expenses.total) || 0;
  const spentPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const dateText = activeTrip.startDate && activeTrip.endDate
    ? `${activeTrip.startDate} – ${activeTrip.endDate}`
    : `${duration} Days`;
  const accommodation = activeTrip.preferences?.accommodation?.[0];

  const daysList = activeTrip.itinerary?.length
    ? activeTrip.itinerary
    : Array.from({ length: duration }, (_, i) => ({ day: i + 1, title: `Day ${i + 1} — Exploration`, theme: 'Exploration', activities: [] }));

  const safeDayIndex = Math.min(activeDayIndex, daysList.length - 1);
  const activeDay = daysList[safeDayIndex];
  const dayActivities = activeDay?.activities || [];

  const activityImage = (activity) => {
    const haystack = `${activity?.category || ''} ${activity?.title || ''}`.toLowerCase();
    return ACTIVITY_IMAGE_RULES.find((rule) => rule.match.test(haystack))?.img || ACTIVITY_IMAGE_FALLBACK;
  };

  const formatDuration = (minutes) => {
    const m = Number(minutes) || 0;
    if (m <= 0) return '';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h}h ${rem}m` : `${h}h`;
  };

  const badgeClassFor = (category) => {
    const c = String(category || '').toLowerCase();
    if (/din|food|restaurant|cafe|gastronomy/.test(c)) return 'green';
    if (/transit|arrival|transfer|departure/.test(c)) return 'blue';
    return 'gray';
  };

  const dayPillLabel = (day) => `Day ${day.day} • ${day.theme || day.title || 'Exploration'}`;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'itinerary', label: 'Timeline Itinerary', dot: true },
    { key: 'map', label: 'Map View' },
    { key: 'hotels', label: 'Hotels', count: activeTrip.hotels?.length || 0 },
    { key: 'restaurants', label: 'Restaurants', count: activeTrip.restaurants?.length || 0 },
    { key: 'places', label: 'Places', count: activeTrip.places?.length || 0 },
    { key: 'expenses', label: 'Expenses' },
  ];

  return (
    <div className="workspace-root ws-v2">
      {/* Top breadcrumb bar */}
      <div className="ws-v2-topbar">
        <div className="ws-v2-crumb">
          <span>Trips</span><span className="sep">/</span><strong>{destination}</strong>
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
          <h1 className="workspace-heading">
            {destination}{country && <><span className="dot-sep">•</span> {country}</>}
          </h1>
        </div>
        <div className="ws-v2-meta">
          <div className="ws-v2-pills">
            <span className="ws-meta-pill"><Calendar size={13} /> {dateText} ({duration} Days)</span>
            <span className="ws-meta-pill"><Users size={13} /> {travelersCount} {travelersCount === 1 ? 'Traveler' : 'Travelers'}</span>
            <span className="ws-meta-pill"><BedDouble size={13} /> {accommodation || country || 'Curated Stays'}</span>
          </div>
          <span className="est-total-pill mono">Est. Total <strong>{money(spent || budget)}</strong></span>
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
                  key={d.day || i}
                  className={`day-pill ${safeDayIndex === i ? 'active' : ''}`}
                  onClick={() => setActiveDayIndex(i)}
                >
                  {safeDayIndex === i && <span className="blue-dot" />}
                  {dayPillLabel(d)}
                </button>
              ))}
            </div>
            <span className="nodes-note mono"><span className="green-dot" /> {dayActivities.length} {dayActivities.length === 1 ? 'NODE' : 'NODES'} SCHEDULED</span>
          </div>

          <div className="ws-v2-content">
            {/* Left timeline */}
            <div className="ws-v2-timeline">
              <div className="seq-head">
                <div>
                  <div className="seq-label">● CHRONOLOGICAL EXECUTION</div>
                  <h2>{activeDay?.title || `Day ${safeDayIndex + 1} Sequence`}</h2>
                </div>
                <div className="seq-actions">
                  <button className="insert-btn">+ Insert Waypoint</button>
                  <button className="filter-btn">☰</button>
                </div>
              </div>

              <div className="timeline-list">
                {dayActivities.length === 0 && (
                  <div className="section-empty">No activities scheduled for this day yet.</div>
                )}
                {dayActivities.map((a, idx) => {
                  const meta = [formatDuration(a.durationMinutes), a.estimatedCost ? money(a.estimatedCost) : ''].filter(Boolean).join(' • ');
                  return (
                    <div key={a.id || idx} className="tl-item">
                      <span className={`tl-dot ${idx === 0 ? 'ring' : ''}`} />
                      <div className="tl-card">
                        <img src={activityImage(a)} alt={a.title} className="tl-thumb" loading="lazy" />
                        <div className="tl-main">
                          <div className="tl-topline mono">
                            <strong>{a.time || '10:00 AM'}</strong>
                            <span className="tl-sep">•</span>
                            <span>{(a.category || 'PLANNED').toUpperCase()}</span>
                            <span className={`tl-badge ${badgeClassFor(a.category)}`}>{(a.period || 'plan').toUpperCase()}</span>
                          </div>
                          <h3>{a.title}</h3>
                          <p>{a.description || a.locationName || 'Details coming soon.'}</p>
                        </div>
                        <div className="tl-side">
                          {meta && <span className="tl-meta mono">{meta}</span>}
                          <MoreVertical size={14} color="#a1a1aa" />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  <div><div className="big-temp">29°C</div><div className="climate-sub">{destination} • Local Conditions</div></div>
                  <div className="climate-right mono">
                    <div>Humidity: <strong>65%</strong></div>
                    <div>Precipitation: <span className="green">Low (5%)</span></div>
                    <div>Wind: <strong>12 km/h WSW</strong></div>
                  </div>
                </div>
              </div>

              <div className="side-card copilot-card">
                <div className="side-head mono blue">● TRAVELAI CO-PILOT SUGGESTION</div>
                <h4>Optimize Day {safeDayIndex + 1} Sequence</h4>
                <p>AI Assistant active. Want to rebalance this day with a closer sunset stop? Reduces walking distance and keeps the route within budget.</p>
                {suggestionApplied ? (
                  <div className="applied-note">✓ Suggestion applied to Day {safeDayIndex + 1}</div>
                ) : (
                  <div className="copilot-btns">
                    <button className="apply-btn" onClick={() => setSuggestionApplied(true)}>Apply Suggestion</button>
                    <button className="dismiss-btn" onClick={() => setSuggestionApplied(false)}>Dismiss</button>
                  </div>
                )}
              </div>

              <div className="side-card">
                <div className="side-head mono">● LIVE BUDGET ENGINE <span className="budget-total mono">{money(spent)} / {money(budget)}</span></div>
                <div className="budget-bar"><div className="budget-fill" style={{ width: `${spentPct}%` }} /></div>
                <div className="budget-row mono"><span className="blue">● {spentPct}% Utilized</span><span className="green">{money(Math.max(0, budget - spent))} Remaining</span></div>
                <div className="budget-foot"><span>Day {safeDayIndex + 1} Forecast: {money(Math.round(spent / Math.max(1, duration)))}</span><button onClick={() => setActiveTab('expenses')}>View Ledger</button></div>
              </div>

              <div className="side-card">
                <div className="side-head mono">⛉ ROUTE TELEMETRY (DAY {safeDayIndex + 1}) <span className="wp-badge mono">{dayActivities.length} WAYPOINTS</span></div>
                <div className="route-map">
                  <svg viewBox="0 0 300 110" className="route-svg">
                    <path d="M10,95 Q80,40 160,65 T250,30 T295,80" fill="none" stroke="#0b5cad" strokeWidth="2.5" strokeDasharray="5 4" />
                    <circle cx="10" cy="95" r="5" fill="#09090b" />
                    <circle cx="160" cy="65" r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
                    <circle cx="250" cy="30" r="6" fill="none" stroke="#0b5cad" strokeWidth="2.5" />
                    <circle cx="250" cy="30" r="2.5" fill="#0b5cad" />
                  </svg>
                  <div className="route-labels mono">
                    <span>◔ {activeDay?.theme || destination}</span>
                    <span className="gps">● Active GPS</span>
                  </div>
                </div>
                <button className="expand-map-btn" onClick={() => setActiveTab('map')}>↗ Expand Interactive Map</button>
              </div>

              <div className="side-card emergency-card">
                <span className="em-icon">◔</span>
                <div><strong>Emergency Support</strong><div className="mono em-sub">Local Tourist Police: 112</div></div>
                <button className="mono" onClick={() => setIsChatOpen(true)}>Dial</button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'map' && (
        <Suspense fallback={<div className="page-loading-spinner"><div className="spinner"></div><p>Loading map…</p></div>}>
          <MapView
            center={activeTrip.latitude && activeTrip.longitude ? { lat: activeTrip.latitude, lng: activeTrip.longitude } : null}
            destination={activeTrip.destination}
            hotels={activeTrip.hotels || []}
            restaurants={activeTrip.restaurants || []}
            places={activeTrip.places || []}
          />
        </Suspense>
      )}
      {activeTab === 'hotels' && <HotelsSection hotels={activeTrip.hotels || []} />}
      {activeTab === 'restaurants' && <RestaurantsSection restaurants={activeTrip.restaurants || []} />}
      {activeTab === 'places' && <PlacesSection places={activeTrip.places || []} />}
      {activeTab === 'expenses' && (
        <ExpenseDashboard
          expenses={activeTrip.expenses || {}}
          budget={activeTrip.budget || 0}
          currency={activeTrip.currency || 'INR'}
          travelers={activeTrip.travelers || { count: 1 }}
          onOpenAIOptimizer={() => setIsOptimizerOpen(true)}
        />
      )}
      {activeTab === 'overview' && (
        <div className="ov-wrap">
          <div className="ov-hero">
            <div>
              <div className="mono ov-label">● TRIP OVERVIEW &amp; SUMMARY</div>
              <h3>{duration}-Day Curated Journey in {destination}</h3>
              <p>
                {duration}-day curated route across {destination}{country ? `, ${country}` : ''} with
                verified stays, top-rated dining, and day-by-day waypoints synced to your budget.
              </p>
              <div className="ov-facts">
                <span className="ov-fact mono"><Calendar size={12} /> {dateText} • {duration} Days</span>
                <span className="ov-fact mono"><Users size={12} /> {travelersCount} {travelersCount === 1 ? 'Traveler' : 'Travelers'}</span>
                <span className="ov-fact mono"><BedDouble size={12} /> {accommodation || 'Curated Stays'}</span>
                <span className="ov-fact mono">≈ {money(budget)} Total</span>
              </div>
              <button className="btn-ws-primary blue-btn" style={{ marginTop: 14 }} onClick={() => setActiveTab('itinerary')}>
                <MapPin size={13} /> View Timeline
              </button>
            </div>
            <div className="ov-route">
              <div className="mono ov-route-head">ROUTE SNAPSHOT • {duration}D</div>
              {activeTrip.origin?.name && (
                <div className="ov-route-row"><span>Arrival</span><strong>{activeTrip.origin.name} → {destination}</strong></div>
              )}
              {Number(activeTrip.distanceKm) > 0 && (
                <div className="ov-route-row"><span>Transit</span><strong>{activeTrip.distanceKm} km • {activeTrip.transportMode || 'Multi-modal'}</strong></div>
              )}
              <div className="ov-route-row"><span>Stays</span><strong>{activeTrip.hotels?.length || 0} properties indexed</strong></div>
              <div className="ov-route-row"><span>Dining</span><strong>{activeTrip.restaurants?.length || 0} restaurants shortlisted</strong></div>
              <div className="ov-status mono"><span className="green-dot" /> SYNCED • Google Calendar + Offline Wallet</div>
            </div>
          </div>
        </div>
      )}

      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        trip={{
          destination,
          duration,
          budget,
          currency: activeTrip.currency || 'INR',
          travelers: activeTrip.travelers || { count: travelersCount, type: 'Solo' },
        }}
      />

      <AIBudgetOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        trip={{
          destination,
          duration,
          budget,
          currency: activeTrip.currency || 'INR',
          travelers: activeTrip.travelers || { count: travelersCount, type: 'Solo' },
        }}
      />
      <button
        onClick={() => setIsChatOpen(true)}
        style={{ position: 'fixed', bottom: 'calc(16px + env(safe-area-inset-bottom))', right: 16, background: '#0b5cad', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 18px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', boxShadow: '0 6px 20px rgba(11,92,173,0.4)', zIndex: 60 }}
      >
        <Sparkles size={14} /> Ask TravelAI
      </button>
    </div>
  );
};

export default TripDetailsPage;
