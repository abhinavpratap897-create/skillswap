import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('skillswap-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => { logout(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (tokenData) => {
    localStorage.setItem('skillswap-token', tokenData.access_token);
    localStorage.setItem('skillswap-refresh', tokenData.refresh_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.access_token}`;
    setToken(tokenData.access_token);
    setUser(tokenData.user);
  };

  const logout = () => {
    localStorage.removeItem('skillswap-token');
    localStorage.removeItem('skillswap-refresh');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
