import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { AlertCircle, RefreshCw, Check } from 'lucide-react';

const steps = [
  { title: 'Creating your trip...', desc: 'Setting up parameters and traveler profiles' },
  { title: 'Finding places...', desc: 'Fetching authentic hotels, dining and landmarks via Google Places' },
  { title: 'Planning itinerary...', desc: 'Gemini AI is structuring your morning, afternoon and evening schedule' },
  { title: 'Calculating expenses...', desc: 'Estimating accommodation, transit, food and activity costs' },
  { title: 'Optimizing your route...', desc: 'Finalizing map coordinates and verified location data' },
];

const pctMap = [18, 42, 64, 84, 98];

const GeneratingTripPage = () => {
  const navigate = useNavigate();
  const { plannerState, generateTripPlan } = useTrip();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const destination = plannerState.destination || 'Dubai, UAE';
  const destCode = destination.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'DUBAI';
  const pct = pctMap[Math.min(currentStepIndex, pctMap.length - 1)];

  const runGeneration = useCallback(async () => {
    setError(null);
    setIsRetrying(true);
    setCurrentStepIndex(0);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1400);

    try {
      const trip = await generateTripPlan();
      clearInterval(stepInterval);
      if (trip && (trip._id || trip.tripId)) {
        navigate(`/trip/${trip._id || trip.tripId}`);
      } else {
        navigate('/my-trips');
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  }, [generateTripPlan, navigate]);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    runGeneration();
  }, [runGeneration]);

  return (
    <div className="gen-page-root">
      <div className="gen-top-badge mono">● ROUTE-SYNTH-V4 • {destCode}-G2</div>

      <h1 className="gen-title">
        Designing Your Dream Trip to
        <span className="gen-dest">{destination}</span>
      </h1>
      <p className="gen-sub">Sit back while our AI engine architects your personalized journey</p>

      <div className="gen-card">
        <div className="gen-card-head">
          <span className="mono gen-prog-label">● AI SYNTHESIS PROGRESS <span className="pct-pill">{pct}%</span></span>
          <span className="mono gen-model">MODEL: ROUTE-SYNTH-V4</span>
        </div>
        <div className="gen-progress-track">
          <div className="gen-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        {error ? (
          <div className="generation-error-box">
            <AlertCircle size={28} className="error-icon" />
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-primary" onClick={runGeneration} disabled={isRetrying}>
                <RefreshCw size={16} className={isRetrying ? 'spin' : ''} />
                <span>{isRetrying ? 'Retrying...' : 'Retry Generation'}</span>
              </button>
              <button className="btn-secondary" onClick={() => navigate('/plan')}>
                Back to Planner
              </button>
            </div>
          </div>
        ) : (
          <div className="gen-steps">
            {steps.map((s, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={idx} className={`gen-step ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}>
                  <span className="gen-step-icon">
                    {isDone ? <Check size={16} /> : isCurrent ? <span className="gen-spinner" /> : <span className="gen-dot" />}
                  </span>
                  <div className="gen-step-text">
                    <strong>{s.title}</strong>
                    <span>{s.desc}</span>
                  </div>
                  <span className={`mono gen-status ${isDone ? 'complete' : isCurrent ? 'syncing' : 'queued'}`}>
                    {isDone ? '● COMPLETE' : isCurrent ? '● ○ SYNCING...' : '○ QUEUED'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="gen-card-foot">
          <span className="mono gen-latency">◷ LATENCY: 114ms <span className="foot-sep">•</span> <span className="live-green">● LIVE RADAR</span></span>
          <button className="cancel-gen-btn" onClick={() => navigate('/plan')}>Cancel Generation</button>
        </div>
      </div>

      <div className="gen-strip">
        <div className="gen-mini mono">INDEXED: <strong>142 stays • 38 routes</strong></div>
        <div className="gen-mini mono">PLACES API: <span className="live-green">● CONNECTED</span></div>
        <div className="gen-mini mono">GEMINI: <span className="struct-blue">● STRUCTURING</span></div>
      </div>

      <div className="mono gen-geo">GEO-VECTOR: 25.2048° N, 55.2708° E • CLUSTER: AE-DXB-BURJ • ENCRYPTION: SHA-256</div>
    </div>
  );
};

export default GeneratingTripPage;
