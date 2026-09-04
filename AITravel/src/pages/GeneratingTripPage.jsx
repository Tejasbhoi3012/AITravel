import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Sparkles, Compass, MapPin, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const GeneratingTripPage = () => {
  const navigate = useNavigate();
  const { plannerState, generateTripPlan } = useTrip();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const steps = [
    { title: 'Creating your trip...', desc: 'Setting up parameters and traveler profiles' },
    { title: 'Finding places...', desc: 'Fetching authentic hotels, dining and landmarks via Google Places' },
    { title: 'Planning itinerary...', desc: 'Gemini AI is structuring your morning, afternoon and evening schedule' },
    { title: 'Calculating expenses...', desc: 'Estimating accommodation, transit, food and activity costs' },
    { title: 'Optimizing your route...', desc: 'Finalizing map coordinates and verified location data' },
  ];

  const runGeneration = async () => {
    setError(null);
    setIsRetrying(true);
    setCurrentStepIndex(0);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

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
  };

  useEffect(() => {
    runGeneration();
  }, []);

  return (
    <div className="generating-page-container">
      <div className="generating-card">
        <div className="sparkle-orbit-loader">
          <div className="orbit-spinner">
            <Sparkles size={36} className="orbit-sparkle" />
          </div>
        </div>

        <div className="generating-header">
          <h2>Designing Your Dream Trip to <span className="highlight-destination">{plannerState.destination || 'Destination'}</span></h2>
          <p>Sit back while our AI engine architects your personalized journey</p>
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
          <div className="steps-progress-list">
            {steps.map((s, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`progress-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}
                >
                  <div className="step-status-icon">
                    {isDone ? (
                      <CheckCircle2 size={20} className="icon-done" />
                    ) : isCurrent ? (
                      <div className="step-mini-spinner" />
                    ) : (
                      <div className="step-dot" />
                    )}
                  </div>
                  <div className="step-info">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratingTripPage;
