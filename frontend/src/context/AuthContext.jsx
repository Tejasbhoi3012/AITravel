import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('travelai_token') || null);
  const [loading, setLoading] = useState(true);
  const [welcomeUser, setWelcomeUser] = useState(null);

  const logout = () => {
    localStorage.removeItem('travelai_token');
    setToken(null);
    setUser(null);
    setWelcomeUser(null);
  };

  const dismissWelcome = () => setWelcomeUser(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const data = await authService.getProfile();
          if (data.success && data.user) {
            setUser(data.user);
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          localStorage.removeItem('travelai_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.token) {
      localStorage.setItem('travelai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setWelcomeUser(data.user || { name: 'Traveler' });
    }
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    if (data.token) {
      localStorage.setItem('travelai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setWelcomeUser(data.user || { name });
    }
    return data;
  };

  const googleLogin = async (userData) => {
    const data = await authService.googleLogin(userData);
    if (data.token) {
      localStorage.setItem('travelai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setWelcomeUser(data.user || { name: 'Traveler' });
    }
    return data;
  };

  const updateProfile = async (profileData) => {
    const data = await authService.updateProfile(profileData);
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        welcomeUser,
        dismissWelcome,
        login,
        register,
        googleLogin,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
