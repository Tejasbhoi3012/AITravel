import { ShieldCheck, Gauge, Globe } from 'lucide-react';
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
            <span>TravelAI</span>
            <span className="footer-version-badge">v2.0.4</span>
          </div>
          <p className="footer-description">
            Algorithmic, zero-latency travel orchestration engine for modern explorers,
            nomads, and high-precision logistics planning.
          </p>
          <div className="footer-badges-list">
            <span className="footer-sec-pill">
              <ShieldCheck size={12} />
              SOC2 TYPE II
            </span>
            <span className="footer-sec-pill">
              <Gauge size={12} />
              &lt;15s ENGINE
            </span>
            <span className="footer-sec-pill">
              <Globe size={12} />
              85+ COUNTRIES
            </span>
          </div>
        </div>

        {/* Product Column */}
        <div className="footer-links-col">
          <h4 className="footer-column-heading">PRODUCT</h4>
          <ul className="footer-link-list">
            <li><a href="/plan">Route Synthesizer</a></li>
            <li><a href="/plan">Multi-Modal Flights</a></li>
            <li><a href="/plan">Bespoke Lodging Matrix</a></li>
            <li><a href="/plan">Autonomous Booking</a></li>
            <li><a href="/plan">Telemetry API</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="footer-links-col">
          <h4 className="footer-column-heading">COMPANY</h4>
          <ul className="footer-link-list">
            <li><a href="#blog">Engineering Blog</a></li>
            <li><a href="#research">Research &amp; Benchmarks</a></li>
            <li><a href="#wayfinding">Global Wayfinding</a></li>
            <li><a href="#press">Press Kit</a></li>
            <li>
              <a href="#careers" className="careers-link">
                Careers
                <span className="hiring-badge">WE&apos;RE HIRING</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Stay Synchronized Column */}
        <div className="footer-newsletter-col">
          <h4 className="footer-column-heading">STAY SYNCHRONIZED</h4>
          <p className="footer-description">
            Receive weekly telemetry updates and algorithmic destination drops.
          </p>
          {subscribed ? (
            <div className="footer-subscribed-msg">
              ✓ Subscribed! Watch your inbox for telemetry drops.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-box">
              <input
                type="email"
                required
                placeholder="Enter your terminal email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Join</button>
            </form>
          )}
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© 2026 TravelAI Systems Inc. All rights reserved.</span>
        <div className="footer-legal-links">
          <a href="#privacy">Privacy Policy</a>
          <span className="legal-dot">•</span>
          <a href="#terms">Terms of Service</a>
          <span className="legal-dot">•</span>
          <a href="#security">Security Architecture</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
