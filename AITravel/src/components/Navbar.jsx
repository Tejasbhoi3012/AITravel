import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Send } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : 'AS';

  return (
    <nav className="travel-navbar nav-v2">
      <div className="nav-container">
        {/* Left: Brand & Badges */}
        <div className="nav-brand-group">
          <Link to="/" className="nav-brand-group">
            <div className="brand-logo-icon black-logo">
              <Send size={16} />
            </div>
            <span className="brand-title">TravelAI</span>
          </Link>
          <span className="brand-badge version-pill mono">v2.0.4</span>
          <span className="brand-counter-badge itineraries-pill mono">● 21,000+ ITINERARIES BUILT</span>
        </div>

        {/* Center: Navigation links */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active-blue' : ''}`}>
            Explore
          </Link>
          <Link to="/plan" className={`nav-link ${location.pathname === '/plan' ? 'active-blue' : ''}`}>
            Plan a Trip {location.pathname === '/plan' && <span className="nav-dot" />}
          </Link>
          <Link to="/my-trips" className={`nav-link ${location.pathname === '/my-trips' ? 'active-blue' : ''}`}>
            My Trips
          </Link>
          <a href="#community" className="nav-link">
            Community
          </a>
        </div>

        {/* Right: Search Box + Bell + Avatar */}
        <div className="nav-right-actions">
          <div className="nav-search-bar" onClick={() => navigate('/plan')}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search destinations..."
              readOnly
              style={{ cursor: 'pointer' }}
            />
            <span className="kbd-badge">⌘K</span>
          </div>

          <button className="nav-bell-btn" title="Notifications">
            <Bell size={18} />
            <span className="bell-dot" />
          </button>

          <Link to={isAuthenticated ? '/profile' : '/login'} className="nav-avatar-circle">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="User profile" className="nav-avatar-img" />
            ) : (
              <span>{initials}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
