import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlanTripPage from './pages/PlanTripPage';
import GeneratingTripPage from './pages/GeneratingTripPage';
import TripDetailsPage from './pages/TripDetailsPage';
import MyTripsPage from './pages/MyTripsPage';
import ProfilePage from './pages/ProfilePage';
import SharedTripPage from './pages/SharedTripPage';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router>
          <div className="travel-app-root">
            <Navbar />
            <main className="travel-main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/plan" element={<PlanTripPage />} />
                <Route path="/generating" element={<GeneratingTripPage />} />
                <Route path="/trip/:id" element={<TripDetailsPage />} />
                <Route path="/trip/share/:token" element={<SharedTripPage />} />
                
                {/* Protected Routes */}
                <Route
                  path="/my-trips"
                  element={
                    <ProtectedRoute>
                      <MyTripsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
