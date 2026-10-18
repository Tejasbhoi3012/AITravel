import { Linkedin, Github, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const LINKEDIN_URL = 'https://www.linkedin.com/in/tejas-bhoi';
const GITHUB_URL = 'https://github.com/Tejasbhoi3012';
const EMAIL = 'tejas302002@gmail.com';
const CONTACT_URL = `mailto:${EMAIL}`;

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Explore Destinations', to: '/' },
  { label: 'AI Trip Planner', to: '/plan' },
  { label: 'My Trips', to: '/my-trips' },
  { label: 'About', to: '/' },
];

const CONNECT_LINKS = [
  { label: 'LinkedIn', href: LINKEDIN_URL, icon: Linkedin, external: true },
  { label: 'GitHub', href: GITHUB_URL, icon: Github, external: true },
  { label: 'Email', href: CONTACT_URL, icon: Mail, external: false },
];

const Footer = () => {
  return (
    <footer className="travel-footer">
      <div className="footer-inner-grid">
        {/* Brand column */}
        <div className="footer-brand-col">
          <div className="footer-brand-title">
            <span className="black-logo footer-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </span>
            <span>TravelAI</span>
          </div>
          <p className="footer-description">
            Next-gen AI travel planner empowering explorers with personalized,
            zero-latency itineraries.
          </p>
        </div>

        {/* Quick links */}
        <div className="footer-links-col">
          <h4 className="footer-column-heading">QUICK LINKS</h4>
          <ul className="footer-link-list">
            {QUICK_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect with me */}
        <div className="footer-links-col">
          <h4 className="footer-column-heading">CONNECT WITH ME</h4>
          <ul className="footer-connect-list">
            {CONNECT_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="footer-connect-item"
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    <Icon size={15} />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Get in touch */}
        <div className="footer-newsletter-col">
          <h4 className="footer-column-heading">GET IN TOUCH</h4>
          <p className="footer-description">
            Have a project in mind or want to collaborate on AI tools? Let&apos;s connect.
          </p>
          <a href={CONTACT_URL} className="footer-contact-btn">Contact Me</a>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© 2026 TravelAI. All rights reserved.</span>
        <div className="footer-legal-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub Repository</a>
          <span className="legal-dot">•</span>
          <a href="#privacy">Privacy Policy</a>
          <span className="legal-dot">•</span>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
