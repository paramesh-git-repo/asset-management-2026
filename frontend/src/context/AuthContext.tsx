import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storedUserKey = 'authUser';

  const getStoredUser = (): User | null => {
    const raw = localStorage.getItem(storedUserKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  };

  const persistUser = (nextUser: User | null) => {
    if (!nextUser) {
      localStorage.removeItem(storedUserKey);
      return;
    }
    localStorage.setItem(storedUserKey, JSON.stringify(nextUser));
  };

  const normalizeUser = (base: Partial<User> & { id: string; email: string; role: User['role'] }): User => {
    const fallbackName = base.email.split('@')[0] || 'User';
    return {
      id: base.id,
      email: base.email,
      role: base.role,
      status: base.status || 'ACTIVE',
      name: (base.name || '').trim() || fallbackName,
      profileImage: base.profileImage ?? null,
    };
  };

  const validateToken = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      // Check if token is expired (with 5 second buffer)
      return decoded.exp > currentTime - 5;
    } catch (error) {
      return false;
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await authApi.refreshToken({ refreshToken });
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);

      const decoded = jwtDecode<DecodedToken>(response.tokens.accessToken);
      const existingUser = getStoredUser();
      const nextUser = normalizeUser({
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role as 'Admin' | 'Manager' | 'Employee',
        name: existingUser?.name,
        status: existingUser?.status,
        profileImage: existingUser?.profileImage ?? null,
      });
      setUser(nextUser);
      persistUser(nextUser);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      // Validate access token
      if (validateToken(accessToken)) {
        try {
          const decoded = jwtDecode<DecodedToken>(accessToken);
          const existingUser = getStoredUser();
          const nextUser = normalizeUser({
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role as 'Admin' | 'Manager' | 'Employee',
            name: existingUser?.name,
            status: existingUser?.status,
            profileImage: existingUser?.profileImage ?? null,
          });
          setUser(nextUser);
          persistUser(nextUser);
        } catch (error) {
          console.error('Token decode error:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem(storedUserKey);
        }
        setIsLoading(false);
        return;
      }

      // Access token expired, try to refresh
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(storedUserKey);
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('accessToken', response.tokens.accessToken);
    localStorage.setItem('refreshToken', response.tokens.refreshToken);
    const nextUser = normalizeUser({
      id: response.user.id,
      email: response.user.email,
      role: response.user.role,
      status: response.user.status,
      name: response.user.name,
      profileImage: response.user.profileImage ?? null,
    });
    setUser(nextUser);
    persistUser(nextUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberedEmail'); // Clear remembered email on logout
      localStorage.removeItem(storedUserKey);
      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUser: User) => {
    const nextUser = normalizeUser(updatedUser);
    setUser(nextUser);
    persistUser(nextUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

