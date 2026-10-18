import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell, Send, LogOut, Plane, Trash2, LogIn, Menu, X, Moon, Sun } from 'lucide-react';

const NOTIF_ICONS = { trip: Plane, deleted: Trash2, auth: LogIn };

const NAV_LINKS = [
  { to: '/', label: 'Explore', hint: 'Browse destinations' },
  { to: '/plan', label: 'Plan a Trip', hint: 'Build an itinerary' },
  { to: '/my-trips', label: 'Trip History', hint: 'Saved trips' },
];

const timeAgo = (timestamp, now) => {
  const seconds = Math.max(1, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [failedSrc, setFailedSrc] = useState(null);
  const [notifsPath, setNotifsPath] = useState(null);
  const [notifsOpenedAt, setNotifsOpenedAt] = useState(0);
  const [menuPath, setMenuPath] = useState(null);

  // Panels are bound to the route they were opened on, so navigating away closes them
  const showNotifs = notifsPath !== null && notifsPath === location.pathname;
  const showMenu = menuPath !== null && menuPath === location.pathname;

  const toggleMenu = () => setMenuPath(showMenu ? null : location.pathname);
  const closeMenu = () => setMenuPath(null);

  const toggleNotifs = () => {
    if (showNotifs) {
      setNotifsPath(null);
    } else {
      setNotifsOpenedAt(Date.now());
      markAllRead();
      setNotifsPath(location.pathname);
    }
  };

  const closeNotifs = () => setNotifsPath(null);

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : 'AS';

  const showAvatarPhoto = user?.profileImage && failedSrc !== user.profileImage;

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
            Trip History
          </Link>
        </div>

        {/* Right: Search Box + Bell + Auth */}
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

          <button
            type="button"
            className="theme-toggle-btn"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={18} /> : <Moon size={17} />}
          </button>

          <div className="nav-notif-wrap">
            <button className="nav-bell-btn" title="Notifications" onClick={toggleNotifs}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="bell-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {showNotifs && (
              <>
                <div className="nav-notif-backdrop" onClick={closeNotifs} />
                <div className="nav-notif-panel">
                  <div className="nav-notif-head">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <button type="button" onClick={clearAll}>Clear all</button>
                    )}
                  </div>
                  <div className="nav-notif-list">
                    {notifications.length === 0 ? (
                      <div className="nav-notif-empty">
                        <Bell size={22} />
                        <p>No notifications yet</p>
                        <span>Generate a trip and updates will appear here.</span>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const Icon = NOTIF_ICONS[n.type] || Bell;
                        return (
                          <div key={n.id} className={`nav-notif-item ${n.read ? '' : 'unread'}`}>
                            <span className={`nav-notif-icon ${n.type || 'default'}`}>
                              <Icon size={15} />
                            </span>
                            <div className="nav-notif-body">
                              <p>{n.title}</p>
                              {n.message && <span>{n.message}</span>}
                              <time>{notifsOpenedAt ? timeAgo(n.createdAt, notifsOpenedAt) : ''}</time>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-avatar-circle" title="Open profile">
                {showAvatarPhoto ? (
                  <img
                    src={user.profileImage}
                    alt="User profile"
                    className="nav-avatar-img"
                    referrerPolicy="no-referrer"
                    onError={() => setFailedSrc(user.profileImage)}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </Link>
              <button
                type="button"
                className="nav-auth-btn"
                title="Log out of your account"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={15} /> <span className="auth-btn-text">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-auth-btn">
                Log in
              </Link>
              <Link to="/register" className="nav-auth-btn primary">
                Sign up
              </Link>
            </>
          )}

          <button type="button" className="nav-hamburger" onClick={toggleMenu} aria-label="Toggle navigation menu">
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {showMenu && (
        <>
          <div className="nav-notif-backdrop" onClick={closeMenu} />
          <div className="nav-mobile-panel">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-mobile-link ${location.pathname === item.to ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>{item.label}</span>
                <span className="nav-mobile-hint">{location.pathname === item.to ? '● Active' : item.hint}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/profile" className="nav-mobile-link" onClick={closeMenu}>
                <span>My Profile</span>
                <span className="nav-mobile-hint">{user?.email || ''}</span>
              </Link>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
