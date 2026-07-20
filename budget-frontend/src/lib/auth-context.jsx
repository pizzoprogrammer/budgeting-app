import { createContext, useState, useEffect, useContext } from 'react';
import { api, setApiLogoutCallback } from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Set up token expiration handler for API
  useEffect(() => {
    const logout = () => {
      setUser(null);
      setToken(null);
    };
    setApiLogoutCallback(logout);
  }, []);

  // fetch profile when token changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const profile = await api.profile.get(token);
          if (profile && !profile.error) {
            setUser(profile);
          }
        } catch (e) {
          console.error('Failed to fetch profile', e);
        }
      }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading, setLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
