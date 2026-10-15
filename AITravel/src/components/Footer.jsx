import { Compass } from 'lucide-react';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="travel-footer">
      <div className="footer-inner-grid">
        {/* Brand column */}
        <div className="footer-brand-col">
          <div className="footer-brand-title">
            <div className="brand-logo-icon" style={{ width: 28, height: 28 }}>
              <Compass size={16} />
            </div>
            <span>TravelAI</span>
            <span className="brand-badge">TravelAI 2.0</span>
          </div>
          <p className="footer-description">
            Precision-engineered autonomous travel design. Discover, curate, and optimize your global itineraries in seconds with predictive neural intelligence.
          </p>
          <div className="footer-badges-list">
            <span className="footer-sec-pill">🔒 SOC2 Certified</span>
            <span className="footer-sec-pill">⚡ &lt;15s Engine</span>
            <span className="footer-sec-pill">🌐 85+ Global Hubs</span>
          </div>
        </div>

        {/* Product Column */}
        <div className="footer-links-col">
          <h4 className="footer-column-heading">Product</h4>
          <ul className="footer-link-list">
            <li><a href="/plan">Smart Engine</a></li>
            <li><a href="/plan">AI Trip Planner</a></li>
            <li><a href="/plan">Live Flights &amp; Stays</a></li>
            <li><a href="#community">Community Itineraries</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="footer-links-col">
          <h4 className="footer-column-heading">Company</h4>
          <ul className="footer-link-list">
            <li><a href="#about">About Us</a></li>
            <li><a href="#destinations">Global Destinations</a></li>
            <li><a href="#sustainability">Sustainability Pledge</a></li>
            <li><a href="#privacy">Privacy &amp; Terms</a></li>
          </ul>
        </div>

        {/* Stay Inspired Column */}
        <div className="footer-newsletter-col">
          <h4 className="footer-column-heading">Stay Inspired</h4>
          <p className="footer-description" style={{ margin: '0 0 10px 0' }}>
            Receive curated season spots and algorithmic flight deal drops every week.
          </p>
          {subscribed ? (
            <div style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>
              ✓ Subscribed! Watch your inbox for weekly deal drops.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-box">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Join</button>
            </form>
          )}
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            No spam. Unsubscribe at anytime.
          </span>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© 2026 TravelAI Inc. All rights reserved. Crafted for seamless wanderlust.</span>
        <div className="footer-legal-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#security">Security</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
