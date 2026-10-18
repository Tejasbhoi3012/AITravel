import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const notifyAuth = (data, title, message) => {
    addNotification(
      { type: 'auth', title, message },
      data.user?._id || data.user?.email
    );
  };

  const pwLen = password.length;
  const pwStrength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen < 10 ? 2 : 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (!agreed) {
      return setError('Please agree to the Terms of Service & Privacy Policy');
    }

    setLoading(true);
    try {
      const data = await register(name, email, password);
      notifyAuth(data, 'Account created', `Welcome to TravelAI, ${data.user?.name || name || 'traveler'}!`);
      navigate('/my-trips');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await login('traveler@example.com', 'traveler123');
      notifyAuth(data, 'Logged in successfully', `Welcome back, ${data.user?.name || 'traveler'}`);
      navigate('/my-trips');
    } catch {
      setError('Demo login failed. Please sign up for a new account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-v2">
      <div className="auth-top-badge mono">● SECURE TERMINAL • SHA-256 • SOC2</div>
      <h1 className="auth-hero-title">Create Your Account</h1>
      <p className="auth-hero-sub">Start planning personalized journeys with AI</p>

      <div className="auth-split-card">
        {/* Left dark panel */}
        <div className="auth-brand-panel">
          <span className="auth-glass-pill mono">● JOIN 250,000+ MODERN NOMADS</span>
          <h2>Your autonomous travel engine, <span className="gold">ready in seconds.</span></h2>
          <p className="brand-desc">Free explorer account. Synthesize itineraries, unlock telemetry, audit every rupee.</p>

          <div className="brand-row">
            <span className="brand-ico green">⚡</span>
            <div><strong>&lt;15s Engine</strong><span>Median synth latency</span></div>
            <span className="row-badge green mono">● VERIFIED</span>
          </div>
          <div className="brand-row">
            <span className="brand-ico blue">⊕</span>
            <div><strong>85+ Countries</strong><span>Live multi-modal radar</span></div>
            <span className="row-badge blue mono">● RADAR</span>
          </div>
          <div className="brand-row">
            <span className="brand-ico gold">★</span>
            <div><strong>4.98/5 Rating</strong><span>Loved by nomads</span></div>
            <span className="stars">★★★★★</span>
          </div>

          <div className="brand-trust">
            <div className="avatar-stack">
              <span className="stack-av purple">TI</span>
              <span className="stack-av cyan">MI</span>
              <span className="stack-av green2">SF</span>
              <span className="stack-av dark">+4k</span>
            </div>
            <span>Trusted by top engineering teams &amp; global explorers</span>
          </div>

          <div className="brand-foot mono">
            <span>SOC2 TYPE II • TLS 1.3</span>
            <span className="enc">AES-256 ENCRYPTED</span>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="form-top-row">
            <span className="mono gateway-label">AUTH // ACCOUNT FORGE</span>
            <span className="mono operational-pill">● SYSTEM OPERATIONAL</span>
          </div>
          <h3>Create Wayfinding Node</h3>
          <p className="form-sub">Start planning personalized journeys with AI.</p>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>FULL NAME <span className="req mono">PRIMARY PILOT</span></label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                />
              </div>
            </div>

            <div className="form-group">
              <label>EMAIL ADDRESS <span className="req mono boxed">REQUIRED</span></label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>PASSWORD <span className="req mono">TLS 1.3 PASSKEY</span></label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="pw-strength">
                <div className="pw-bars">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`pw-bar ${pwStrength > i ? 'on' : ''}`} />
                  ))}
                </div>
                <div className="pw-labels mono">
                  <span>{pwLen === 0 ? 'Awaiting entropy...' : pwStrength === 1 ? 'Weak — keep typing' : pwStrength === 2 ? 'Strong cryptographic entropy' : 'Strong cryptographic entropy'}</span>
                  <span className="secure-green">{pwStrength >= 2 ? '256-BIT SECURE' : ''}</span>
                </div>
              </div>
            </div>

            <div className="remember-row terms-row">
              <button type="button" className={`check-box ${agreed ? 'on' : ''}`} onClick={() => setAgreed(!agreed)}>
                {agreed && <Check size={13} />}
              </button>
              <span onClick={() => setAgreed(!agreed)} style={{ cursor: 'pointer' }}>I agree to the Terms of Service &amp; Privacy Policy</span>
            </div>

            <button type="submit" className="btn-auth-submit black-big" disabled={loading}>
              <span>{loading ? 'Forging Account...' : 'Sign Up Free'}</span>
              <ArrowRight size={16} />
            </button>

            <button type="button" className="btn-demo-v2" disabled={loading} onClick={handleDemoLogin}>
              <span>⚡ Try Demo Explorer Account</span>
            </button>

            <GoogleSignInButton onError={setError} />
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here →</Link></p>
            <span className="mono salted-note">Zero credentials stored in plaintext. Cryptographically salted.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
