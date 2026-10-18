import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const STORAGE_KEY = 'travelai_notifications';
const MAX_PER_USER = 30;

const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [all, setAll] = useState(loadAll);

  const userKey = user?._id || user?.email || 'guest';
  const notifications = all[userKey] || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // storage unavailable — notifications stay in memory for this session
    }
  }, [all]);

  const addNotification = useCallback((notification, targetKey) => {
    const key = targetKey || userKey;
    const entry = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      read: false,
      ...notification,
    };
    setAll((prev) => ({
      ...prev,
      [key]: [entry, ...(prev[key] || [])].slice(0, MAX_PER_USER),
    }));
  }, [userKey]);

  const markAllRead = useCallback(() => {
    setAll((prev) => {
      const list = prev[userKey] || [];
      if (!list.some((n) => !n.read)) return prev;
      return { ...prev, [userKey]: list.map((n) => (n.read ? n : { ...n, read: true })) };
    });
  }, [userKey]);

  const clearAll = useCallback(() => {
    setAll((prev) => {
      if (!(prev[userKey] || []).length) return prev;
      const next = { ...prev };
      delete next[userKey];
      return next;
    });
  }, [userKey]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
