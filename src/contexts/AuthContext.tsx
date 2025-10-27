import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, handleApiError } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentAdmin = await api.getCurrentAdmin();
      setAdmin(currentAdmin);
    } catch (error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      setAdmin(response.admin);
      navigate('/dashboard');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setAdmin(null);
      navigate('/login');
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
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
