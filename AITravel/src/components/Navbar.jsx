import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Search, Bell, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="travel-navbar">
      <div className="nav-container">
        {/* Left: Brand & Badges */}
        <div className="nav-brand-group">
          <Link to="/" className="nav-brand-group">
            <div className="brand-logo-icon">
              <Compass size={20} />
            </div>
            <span className="brand-title">TravelAI</span>
          </Link>
          <span className="brand-badge">TravelAI 2.0</span>
          <span className="brand-counter-badge">21,000+ ITINERARIES BUILT</span>
        </div>

        {/* Center: Navigation links */}
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active-pill' : ''}`}
          >
            Explore
          </Link>
          <Link
            to="/plan"
            className={`nav-link ${location.pathname === '/plan' ? 'active-pill' : ''}`}
          >
            Plan a Trip
          </Link>
          <Link
            to="/my-trips"
            className={`nav-link ${location.pathname === '/my-trips' ? 'active-pill' : ''}`}
          >
            My Trips
          </Link>
          <a href="#community" className="nav-link">
            Community
          </a>
        </div>

        {/* Right: Search Box + Bell + Avatar */}
        <div className="nav-right-actions">
          <div className="nav-search-bar" onClick={() => navigate('/plan')}>
            <Search size={14} color="#64748b" />
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

          <Link to={isAuthenticated ? '/profile' : '/login'}>
            <img
              src={
                user?.profileImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
              }
              alt="User profile"
              className="nav-avatar-img"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
