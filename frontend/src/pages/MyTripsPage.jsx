import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Sparkles, Trash2 } from 'lucide-react';
import { getTrips, deleteTrip } from '../services/tripService';
import { getCurrencyRates, convertAmount, CURRENCY_SYMBOLS } from '../services/currencyService';
import { useNotifications } from '../context/NotificationContext';

const TRIP_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
];

const tripImage = (destination) => {
  let hash = 0;
  for (const ch of String(destination || '')) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TRIP_IMAGES[hash % TRIP_IMAGES.length];
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const dateRangeFor = (trip) => {
  const start = formatDate(trip.startDate);
  const end = formatDate(trip.endDate);
  if (start && end) return `${start} – ${end}`;
  if (start) return `From ${start}`;
  return 'Dates flexible';
};

const isUpcoming = (trip) => {
  if (!trip.startDate) return false;
  const start = new Date(trip.startDate);
  return !Number.isNaN(start.getTime()) && start > new Date();
};

const MyTripsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rates, setRates] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getTrips()
      .then((data) => {
        if (!cancelled) setTrips(Array.isArray(data?.trips) ? data.trips : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load your trips.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    getCurrencyRates()
      .then((data) => {
        if (!cancelled) setRates(data.rates);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Amounts convert from each trip's own currency into the selected display
  // currency — "Trip Currency" keeps every card in the currency it was planned in.
  const money = (amount, tripCurrency) => {
    const from = tripCurrency || 'INR';
    const target = displayCurrency || from;
    const value = rates && target !== from ? convertAmount(amount, from, target, rates) : Number(amount) || 0;
    return `${CURRENCY_SYMBOLS[target] || ''}${value.toLocaleString('en-IN')}`;
  };

  const stats = useMemo(() => {
    if (trips.length === 0 || !rates) return null;
    const toINR = (amount, currency) => convertAmount(amount, currency || 'INR', 'INR', rates);
    const totalBudget = trips.reduce((sum, t) => sum + toINR(t.budget, t.currency), 0);
    const totalSpent = trips.reduce((sum, t) => sum + toINR(t.expenses?.total, t.currency), 0);
    return {
      count: trips.length,
      upcoming: trips.filter(isUpcoming).length,
      totalBudget,
      totalSpent,
      avgPerTrip: Math.round(totalSpent / trips.length),
    };
  }, [trips, rates]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    const removed = trips.find((t) => t._id === id);
    setDeletingId(id);
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
      const place = (removed?.destinationDetails?.name || removed?.destination || 'your trip').split(',')[0];
      addNotification({
        type: 'deleted',
        title: `Trip to ${place} deleted`,
        message: 'Removed from your trip history.',
      });
    } catch (err) {
      setError(err.message || 'Could not delete the trip.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading-spinner">
        <div className="spinner"></div>
        <p>Loading your trip history…</p>
      </div>
    );
  }

  if (error && trips.length === 0) {
    return (
      <div className="section-empty" style={{ maxWidth: 560, margin: '60px auto' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Could not load your trips</div>
        <p style={{ marginBottom: 14 }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ background: '#09090b', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontWeight: 700, cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="audited-statements-root audit-v2">
      {/* Header */}
      <div className="audit-v2-header">
        <div>
          <div className="audit-v2-toplabel mono">
            TRIP HISTORY <span className="blue-dot" /> {trips.length} SAVED {trips.length === 1 ? 'ITINERARY' : 'ITINERARIES'}
          </div>
          <h1>Your Generated Trips</h1>
          <p>Every itinerary synthesized under your account — reopen, review, or remove any trip.</p>
        </div>
        <div className="audit-v2-headerright">
          <div className="currency-row">
            <button className={displayCurrency === '' ? 'active' : ''} onClick={() => setDisplayCurrency('')}>
              Trip Currency
            </button>
            {Object.keys(CURRENCY_SYMBOLS).map((code) => (
              <button key={code} className={displayCurrency === code ? 'active' : ''} onClick={() => setDisplayCurrency(code)}>
                {code}
              </button>
            ))}
          </div>
          <button className="share-pdf-btn" onClick={() => navigate('/plan')}>
            <Sparkles size={13} /> Plan New Trip
          </button>
        </div>
      </div>

      {error && (
        <p className="mono" style={{ color: '#b91c1c', margin: '0 0 12px' }}>
          {error}
        </p>
      )}

      {/* Real stats across all trips */}
      {stats && (
        <div className="audit-v2-stats">
          <div className="stat-card">
            <div className="stat-top"><span className="mono">SAVED TRIPS</span><span>▤</span></div>
            <div className="stat-big">{stats.count}</div>
            <div className="stat-sub">{stats.upcoming > 0 ? `${stats.upcoming} upcoming` : 'All past or current'}</div>
            <div className="stat-foot mono">Account-scoped history <span className="blue">● Synced</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="mono">TOTAL BUDGET</span><span>⟳</span></div>
            <div className="stat-big">{money(stats.totalBudget, 'INR')}</div>
            <div className="stat-sub">Planned across {stats.count} {stats.count === 1 ? 'trip' : 'trips'}</div>
            <div className="stat-foot mono">Converted live to INR baseline</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="mono">TOTAL FORECAST SPEND</span><span className="green-dot" /></div>
            <div className="stat-big green">{money(stats.totalSpent, 'INR')}</div>
            <div className="stat-sub">Transport + stays + dining + activities</div>
            <div className="stat-foot mono">
              Avg {money(stats.avgPerTrip, 'INR')} <span className="green">/ trip</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span className="mono">BUDGET HEADROOM</span><span>◈</span></div>
            <div className="stat-big">{money(Math.max(0, stats.totalBudget - stats.totalSpent), 'INR')}</div>
            <div className="stat-sub">Forecast sits inside planned ceilings</div>
            <div className="stat-foot mono">
              {stats.totalBudget > 0 ? `${Math.round((stats.totalSpent / stats.totalBudget) * 100)}% utilized` : 'No budget set'}
            </div>
          </div>
        </div>
      )}

      {/* Trip cards */}
      {trips.length === 0 ? (
        <div className="section-empty" style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: 6 }}>No trips yet</div>
          Trips you generate while logged in are saved here, tied to your account.
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => navigate('/plan')}
              style={{ background: '#09090b', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 24px', fontWeight: 700, cursor: 'pointer' }}
            >
              Plan your first trip <ArrowRight size={14} style={{ verticalAlign: '-2px' }} />
            </button>
          </div>
        </div>
      ) : (
        <div className="archived-grid">
          {trips.map((trip) => {
            const travelers = trip.travelers?.count || 1;
            const days = trip.duration || trip.itinerary?.length || 0;
            return (
              <div key={trip._id} className="archived-card">
                <div className="arch-top">
                  <span className="trip-no mono">
                    <span className="blue">TRIP #{(trip._id || '').slice(-6).toUpperCase()}</span>{' '}
                    <span className="completed-badge">{isUpcoming(trip) ? '● UPCOMING' : '● PLANNED'}</span>
                  </span>
                  <span className="arch-amount">
                    <strong>{money(trip.expenses?.total || trip.budget || 0, trip.currency)}</strong>
                    <span className="saved-green mono">{dateRangeFor(trip)}</span>
                  </span>
                </div>
                <h4>{trip.destination || 'Custom Destination'}</h4>
                <span className="arch-dates">
                  {days} Days • {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                  {trip.country ? ` • ${trip.country}` : ''}
                </span>
                <div className="arch-img-wrap">
                  <img src={tripImage(trip.destination)} alt={trip.destination || 'Trip'} loading="lazy" />
                  <span className="arch-overlay mono">
                    <MapPin size={10} style={{ verticalAlign: '-1px' }} /> {(trip.destination || 'CUSTOM').toUpperCase()} • SYNTHESIZED ITINERARY
                  </span>
                </div>
                <div className="arch-costs">
                  <div><span className="mono">BUDGET</span><strong>{money(trip.budget, trip.currency)}</strong></div>
                  <div><span className="mono">TRANSIT</span><strong>{money(trip.expenses?.transportation, trip.currency)}</strong></div>
                  <div><span className="mono">STAYS</span><strong>{money(trip.expenses?.hotel, trip.currency)}</strong></div>
                  <div><span className="mono">DINING</span><strong>{money(trip.expenses?.food, trip.currency)}</strong></div>
                </div>
                <div className="arch-foot">
                  <span>
                    {(trip.hotels?.length || 0)} stays • {(trip.restaurants?.length || 0)} dining • {(trip.places?.length || 0)} sights
                  </span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      disabled={deletingId === trip._id}
                      title="Delete trip"
                      style={{ background: '#fff', color: '#b91c1c', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Trash2 size={12} /> {deletingId === trip._id ? 'Deleting…' : 'Delete'}
                    </button>
                    <button onClick={() => navigate(`/trip/${trip._id}`)}>Open Trip →</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTripsPage;
