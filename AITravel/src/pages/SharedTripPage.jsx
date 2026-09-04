import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as tripService from '../services/tripService';
import { MapPin, Calendar, Users, DollarSign, ArrowLeft } from 'lucide-react';
import ItinerarySection from '../components/ItinerarySection';
import HotelsSection from '../components/HotelsSection';
import RestaurantsSection from '../components/RestaurantsSection';
import PlacesSection from '../components/PlacesSection';
import ExpenseDashboard from '../components/ExpenseDashboard';
import MapView from '../components/MapView';

const SharedTripPage = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const data = await tripService.getSharedTrip(token);
        if (data.success && data.trip) {
          setTrip(data.trip);
        }
      } catch (err) {
        console.warn('Failed to fetch shared trip:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [token]);

  if (loading) {
    return (
      <div className="page-loading-spinner">
        <div className="spinner"></div>
        <p>Loading shared itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="error-page-container">
        <h2>Shared Trip Not Found</h2>
        <p>This trip link may have expired or was made private by the owner.</p>
        <Link to="/" className="btn-primary mt-4">Go to TravelAI Home</Link>
      </div>
    );
  }

  return (
    <div className="trip-details-container">
      <div className="trip-hero-banner">
        <div className="trip-hero-content">
          <span className="destination-badge">
            <MapPin size={16} /> Shared Itinerary • {trip.destination}
          </span>
          <h1 className="trip-headline">{trip.duration}-Day Trip to {trip.destination}</h1>
        </div>
      </div>

      <div className="trip-navigation-tabs">
        <button className={`nav-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`} onClick={() => setActiveTab('itinerary')}>
          <Calendar size={16} /> Itinerary
        </button>
        <button className={`nav-tab-btn ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => setActiveTab('hotels')}>
          Hotels ({trip.hotels?.length || 0})
        </button>
        <button className={`nav-tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`} onClick={() => setActiveTab('restaurants')}>
          Restaurants ({trip.restaurants?.length || 0})
        </button>
        <button className={`nav-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
          Expenses
        </button>
        <button className={`nav-tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          Map
        </button>
      </div>

      <div className="tab-view-content">
        {activeTab === 'itinerary' && <ItinerarySection itinerary={trip.itinerary || []} currency={trip.currency} />}
        {activeTab === 'hotels' && <HotelsSection hotels={trip.hotels || []} />}
        {activeTab === 'restaurants' && <RestaurantsSection restaurants={trip.restaurants || []} />}
        {activeTab === 'expenses' && <ExpenseDashboard expenses={trip.expenses || {}} budget={trip.budget} currency={trip.currency} travelers={trip.travelers} />}
        {activeTab === 'map' && <MapView center={{ lat: trip.latitude, lng: trip.longitude }} destination={trip.destination} hotels={trip.hotels} restaurants={trip.restaurants} places={trip.places} />}
      </div>
    </div>
  );
};

export default SharedTripPage;
