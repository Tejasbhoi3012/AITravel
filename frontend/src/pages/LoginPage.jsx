import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/my-trips');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login('traveler@example.com', 'traveler123');
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
      <h1 className="auth-hero-title">Welcome Back</h1>
      <p className="auth-hero-sub">Sign in to orchestrate and monitor your autonomous AI travel itineraries</p>

      <div className="auth-split-card">
        {/* Left dark panel */}
        <div className="auth-brand-panel">
          <span className="auth-glass-pill mono">● 21,000+ ITINERARIES BUILT</span>
          <h2>Autonomous travel orchestration, <span className="gold">precision-tuned.</span></h2>
          <p className="brand-desc">Real-time multi-modal flight routing, hotel constraint solving, and audited budget forecasting in under 15 seconds.</p>

          <div className="brand-row">
            <span className="brand-ico green">⚡</span>
            <div><strong>&lt;15s Engine</strong><span>Median synth latency</span></div>
            <span className="row-badge green mono">VERIFIED</span>
          </div>
          <div className="brand-row">
            <span className="brand-ico blue">⊕</span>
            <div><strong>85+ Countries</strong><span>Live multi-modal radar</span></div>
            <span className="row-badge blue mono">● RADAR</span>
          </div>
          <div className="brand-row">
            <span className="brand-ico gold">★</span>
            <div><strong>4.98/5 Rating</strong><span>250,000+ modern nomads</span></div>
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
            <span className="mono gateway-label">AUTH // REPOSITORY GATEWAY</span>
            <span className="mono operational-pill">● SYSTEM OPERATIONAL</span>
          </div>
          <h3>Access Wayfinding Node</h3>
          <p className="form-sub">Enter your verified credentials to access your session.</p>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>EMAIL ADDRESS <span className="req mono">REQUIRED</span></label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>PASSWORD <Link to="/register" className="forgot-link">Forgot password?</Link></label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="remember-row">
              <button type="button" className={`check-box ${remember ? 'on' : ''}`} onClick={() => setRemember(!remember)}>
                {remember && <Check size={13} />}
              </button>
              <span onClick={() => setRemember(!remember)} style={{ cursor: 'pointer' }}>Keep terminal active for 30 days</span>
              <span className="mono aes-pill">◈ AES-256 SESSION</span>
            </div>

            <button type="submit" className="btn-auth-submit black-big" disabled={loading}>
              <span>{loading ? 'Signing In...' : 'Sign In to Engine'}</span>
              <ArrowRight size={16} />
            </button>

            <button type="button" className="btn-demo-v2" disabled={loading} onClick={handleDemoLogin}>
              <span>⚡⚡ Try Demo Explorer Account (Instant 1-Click Access)</span>
            </button>

            <GoogleSignInButton onError={setError} />
          </form>

          <div className="auth-footer">
            <p>Don&apos;t have an account? <Link to="/register">Create an account →</Link></p>
            <span className="mono salted-note">Zero credentials stored in plaintext. Cryptographically salted.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
