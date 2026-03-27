import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApiRequest } from '../../utils/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  getSession: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      setLoading(true);
      // Az apiRequest-be épített 401 kezelés miatt, ha nincs token vagy rossz, 
      // az automatikusan logout-ot vált ki, de itt manuálisan is kezeljük:
      const data = await authApiRequest('/session');
      
      if (data && data.user) {
        setUser(data.user);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSession = async () => {
    return await refreshSession();
  }

  const login = async (credentials: any) => {
    try {
      setLoading(true);
      // Itt hívjuk meg a bejelentkezést
      let data = null;
      try {
        data = await authApiRequest('/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        });
      } catch (err) {
        console.error("Bejelentkezési hiba:", err);
        throw(new Error);
      }
      
      if (data && data.token) {
        // Token elmentése (ez kell az apiRequest-nek a következő kérésekhez)
        localStorage.setItem('kozitabor_token', data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('kozitabor_token');
    setUser(null);
    window.location.href = '/kozitabor/auth/login';
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};