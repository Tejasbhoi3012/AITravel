import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Compass, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const greetingFor = (hour) => {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const initialsFor = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const WelcomeModal = () => {
  const { welcomeUser, dismissWelcome } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const [failedPhoto, setFailedPhoto] = useState(null);

  const { firstName, greeting, initials } = useMemo(() => {
    const fullName = welcomeUser?.name?.trim() || 'Traveler';
    return {
      firstName: fullName.split(/\s+/)[0],
      greeting: greetingFor(new Date().getHours()),
      initials: initialsFor(welcomeUser?.name),
    };
  }, [welcomeUser]);

  const photo = welcomeUser?.profileImage;
  const showPhoto = Boolean(photo) && photo !== failedPhoto;

  useEffect(() => {
    if (!welcomeUser) return;

    const onKey = (e) => {
      if (e.key === 'Escape') dismissWelcome();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [welcomeUser, dismissWelcome]);

  if (!welcomeUser) return null;

  const go = (path) => {
    dismissWelcome();
    navigate(path);
  };

  return (
    <div className="welcome-backdrop" onClick={dismissWelcome}>
      <div
        className="welcome-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Welcome ${firstName}`}
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="welcome-glow" aria-hidden="true" />

        <div className="welcome-top">
          <span className="mono welcome-pill">● AUTH COMPLETE • SESSION SECURE</span>
          <button className="welcome-close" onClick={dismissWelcome} aria-label="Close welcome dialog">
            <X size={17} />
          </button>
        </div>

        <div className="welcome-avatar-wrap">
          <span className="welcome-avatar">
            {showPhoto ? (
              <img
                src={photo}
                alt={`${firstName} profile`}
                referrerPolicy="no-referrer"
                onError={() => setFailedPhoto(photo)}
              />
            ) : (
              initials
            )}
          </span>
          <span className="welcome-avatar-badge"><Sparkles size={12} /></span>
        </div>

        <span className="mono welcome-greeting">{greeting.toUpperCase()} • TRAVELER</span>
        <h2 className="welcome-title">
          Welcome, <span className="gold">{firstName}</span>
        </h2>
        <p className="welcome-sub">
          Your autonomous travel engine is live. Synthesize a full multi-city itinerary in under 15 seconds.
        </p>

        <div className="welcome-stats">
          <div className="welcome-stat">
            <strong>&lt;15s</strong>
            <span className="mono">MEDIAN SYNTH</span>
          </div>
          <div className="welcome-stat">
            <strong>85+</strong>
            <span className="mono">COUNTRIES</span>
          </div>
          <div className="welcome-stat">
            <strong>4.98/5</strong>
            <span className="mono">NOMAD RATING</span>
          </div>
        </div>

        <div className="welcome-actions">
          <button className="welcome-btn-primary" onClick={() => go('/plan')}>
            <Compass size={15} /> Plan a Trip
          </button>
          <button className="welcome-btn-secondary" onClick={() => go('/my-trips')}>
            <MapPin size={15} /> View My Trips
          </button>
        </div>

        <div className="welcome-foot mono">
          <span>TLS 1.3 • AES-256 ENCRYPTED</span>
          <span className="welcome-green">● BUDGET MONITORING ON</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
