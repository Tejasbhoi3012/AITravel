import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, AlertCircle, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'USD');
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'balanced');
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cardState, setCardState] = useState('Default');
  const [avatarFailed, setAvatarFailed] = useState(false);

  const isLoading = saving;
  const isSuccess = !saving && cardState === 'Success';
  const isInvalid = !saving && cardState === 'Validation Error';

  const avatarInitial = user?.name?.trim()?.[0]?.toUpperCase() || 'T';
  const showAvatarPhoto = user?.profileImage && !avatarFailed;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSavedMessage('');

    if (!name.trim()) {
      setCardState('Validation Error');
      setError('Full name is required');
      return;
    }

    setSaving(true);
    setCardState('Default');

    try {
      await updateProfile({
        name,
        preferences: {
          currency,
          travelStyle,
        },
      });
      setSavedMessage('Profile and preferences updated successfully!');
      setCardState('Success');
      setTimeout(() => setCardState('Default'), 2500);
      setTimeout(() => setSavedMessage(''), 3200);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setCardState('Validation Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-v2">
      <div className={`profile-card ${isLoading ? 'is-loading' : ''} ${isSuccess ? 'is-success' : ''}`}>
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-circle">
            {showAvatarPhoto ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="profile-avatar-img"
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span>{avatarInitial}</span>
            )}
          </div>
          <span className="profile-avatar-status" />
        </div>

        <h1 className="profile-title">User Profile</h1>
        <p className="profile-email">{user?.email || 'Logged in Traveler'}</p>

        {savedMessage && (
          <div className="alert-success-banner">
            <Check size={16} />
            <span>{savedMessage}</span>
          </div>
        )}

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="profile-form">
          <div className={`form-group ${isInvalid ? 'has-error' : ''}`}>
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {isInvalid && <span className="field-error">Name cannot be empty</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profile-currency">Default Currency</label>
            <select id="profile-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="profile-style">Primary Travel Style</label>
            <select id="profile-style" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
              <option value="balanced">Balanced & Cultural</option>
              <option value="budget">Budget Friendly Explorer</option>
              <option value="luxury">Luxury & Fine Dining</option>
              <option value="adventure">Adventure & Outdoor Sports</option>
            </select>
          </div>

          <div className="sync-panel">
            <div className="sync-row">
              <span className="sync-node">NODE ID : #TRV-88902-IN</span>
              <span className={`sync-state ${isSuccess ? 'is-synced' : ''}`}>
                <span className="sync-state-dot" /> {isSuccess ? 'SYNCED' : 'SECURE SYNC'}
              </span>
            </div>
            <div className="sync-track">
              <div className="sync-fill" />
            </div>
            <p className="sync-caption">Profile synchronization active across 3 regional cluster endpoints.</p>
          </div>

          <button
            type="submit"
            className={`btn-save-profile ${isSuccess ? 'is-success' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-spinner" />
            ) : isSuccess ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            {isLoading ? 'Saving...' : isSuccess ? 'Saved!' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
