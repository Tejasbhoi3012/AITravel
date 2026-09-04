import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, DollarSign, Compass, Check, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'USD');
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'balanced');
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedMessage('');

    try {
      await updateProfile({
        name,
        preferences: {
          currency,
          travelStyle,
        },
      });
      setSavedMessage('Profile and preferences updated successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-circle">
            <User size={36} />
          </div>
          <div>
            <h2>User Profile</h2>
            <p>{user?.email || 'Logged in Traveler'}</p>
          </div>
        </div>

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
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Default Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Primary Travel Style</label>
            <select value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
              <option value="balanced">Balanced & Cultural</option>
              <option value="budget">Budget Friendly Explorer</option>
              <option value="luxury">Luxury & Fine Dining</option>
              <option value="adventure">Adventure & Outdoor Sports</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
