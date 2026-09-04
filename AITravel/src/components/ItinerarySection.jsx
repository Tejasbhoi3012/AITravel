import { useState } from 'react';
import { Clock, MapPin, DollarSign, Plus, Trash2, Edit2, Check, ArrowDown } from 'lucide-react';

const ItinerarySection = ({ itinerary = [], currency = 'USD', onUpdateTrip, onFocusLocation }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityTime, setNewActivityTime] = useState('11:00 AM');
  const [newActivityCost, setNewActivityCost] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);

  const currentDayPlan = itinerary.find((d) => d.day === activeDay) || itinerary[0];

  const handleAddActivity = () => {
    if (!newActivityTitle.trim()) return;

    const newActivity = {
      id: `act_${Date.now()}`,
      time: newActivityTime,
      period: 'afternoon',
      title: newActivityTitle,
      description: 'Custom activity added by user',
      estimatedCost: Number(newActivityCost) || 0,
      durationMinutes: 90,
      category: 'Sightseeing',
    };

    const updatedItinerary = itinerary.map((d) => {
      if (d.day === activeDay) {
        return {
          ...d,
          activities: [...(d.activities || []), newActivity],
        };
      }
      return d;
    });

    if (onUpdateTrip) {
      onUpdateTrip({ itinerary: updatedItinerary });
    }

    setNewActivityTitle('');
    setShowAddModal(false);
  };

  const handleDeleteActivity = (actId) => {
    const updatedItinerary = itinerary.map((d) => {
      if (d.day === activeDay) {
        return {
          ...d,
          activities: (d.activities || []).filter((a) => a.id !== actId && a._id !== actId),
        };
      }
      return d;
    });

    if (onUpdateTrip) {
      onUpdateTrip({ itinerary: updatedItinerary });
    }
  };

  if (!itinerary || itinerary.length === 0) {
    return <div className="section-empty">No itinerary days scheduled yet.</div>;
  }

  return (
    <div className="itinerary-section">
      {/* Day Selector Tabs */}
      <div className="day-tabs-container">
        <div className="day-tabs">
          {itinerary.map((d) => (
            <button
              key={d.day}
              className={`day-tab-btn ${activeDay === d.day ? 'active' : ''}`}
              onClick={() => setActiveDay(d.day)}
            >
              <span className="day-tab-num">Day {d.day}</span>
              <span className="day-tab-title">{d.title?.slice(0, 20)}...</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Day Content */}
      {currentDayPlan && (
        <div className="day-plan-card">
          <div className="day-plan-header">
            <div>
              <span className="day-badge">Day {currentDayPlan.day} Plan</span>
              <h3 className="day-title">{currentDayPlan.title}</h3>
              {currentDayPlan.theme && <p className="day-theme">Theme: {currentDayPlan.theme}</p>}
            </div>
            <button
              className="btn-add-activity"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> Add Activity
            </button>
          </div>

          {/* Activity Timeline */}
          <div className="timeline-container">
            {currentDayPlan.activities && currentDayPlan.activities.length > 0 ? (
              currentDayPlan.activities.map((activity, index) => (
                <div key={activity.id || activity._id || index} className="timeline-item">
                  <div className="timeline-marker">
                    <span className="timeline-number">{index + 1}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="activity-header">
                      <div className="activity-time-badge">
                        <Clock size={13} />
                        <span>{activity.time || 'Flexible'}</span>
                      </div>
                      <div className="activity-actions">
                        {activity.latitude && activity.longitude && onFocusLocation && (
                          <button
                            className="btn-map-pin"
                            onClick={() => onFocusLocation(activity.latitude, activity.longitude, activity.title)}
                            title="View on Map"
                          >
                            <MapPin size={14} /> Map
                          </button>
                        )}
                        <button
                          className="btn-delete-act"
                          onClick={() => handleDeleteActivity(activity.id || activity._id)}
                          title="Remove Activity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 className="activity-title">{activity.title}</h4>
                    <p className="activity-desc">{activity.description}</p>

                    <div className="activity-footer">
                      {activity.category && (
                        <span className="activity-tag">{activity.category}</span>
                      )}
                      {activity.durationMinutes && (
                        <span className="activity-duration">{activity.durationMinutes} mins</span>
                      )}
                      <span className="activity-cost">
                        <DollarSign size={13} />
                        {activity.estimatedCost > 0 ? `${activity.estimatedCost} ${currency}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-activities">No activities added for this day yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <h3>Add Custom Activity to Day {activeDay}</h3>
            <div className="form-group">
              <label>Activity Name</label>
              <input
                type="text"
                value={newActivityTitle}
                onChange={(e) => setNewActivityTitle(e.target.value)}
                placeholder="e.g., Sunset Boat Tour at Calangute"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Time</label>
                <input
                  type="text"
                  value={newActivityTime}
                  onChange={(e) => setNewActivityTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Est. Cost ({currency})</label>
                <input
                  type="number"
                  value={newActivityCost}
                  onChange={(e) => setNewActivityCost(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddActivity}>Add Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItinerarySection;
