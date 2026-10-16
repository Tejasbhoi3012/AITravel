import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

let gisScriptPromise = null;

const loadGisScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google script failed to load'));
      document.head.appendChild(script);
    });
  }
  return gisScriptPromise;
};

// Google Identity Services sign-in button. Sends the ID token (credential)
// to the backend, which verifies it before issuing our JWT. Renders nothing
// when VITE_GOOGLE_CLIENT_ID is not configured.
const GoogleSignInButton = ({ onError }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) {
      setUnavailable(true);
      return;
    }
    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !btnRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response?.credential) {
              onError?.('Google sign-in returned no credential');
              return;
            }
            setLoading(true);
            try {
              await googleLogin({ credential: response.credential });
              navigate('/my-trips');
            } catch (err) {
              onError?.(err.message || 'Google sign-in failed');
            } finally {
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (unavailable) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>
        <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        <span>OR</span>
        <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>
      <div ref={btnRef} style={{ opacity: loading ? 0.6 : 1, minHeight: 40 }} />
      {loading && (
        <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Signing in with Google...</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
