import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AUTH_TOKEN_STORAGE_KEY } from '@/shared/lib/api-client';
import type { AuthenticatedUser, LoginCredentials } from './auth.types';
import { login as loginRequest } from './auth.api';

const USER_STORAGE_KEY = 'sicim.user';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthenticatedUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => readStoredUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    try {
      const result = await loginRequest(credentials);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
      setUser(result.user);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoggingIn, signIn, signOut }),
    [user, isLoggingIn, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
