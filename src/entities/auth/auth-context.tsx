import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initKeycloak, keycloak } from '@/shared/lib/keycloak';
import { getMe } from './auth.api';
import type { AuthenticatedUser } from './auth.types';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUser(me: Awaited<ReturnType<typeof getMe>>): AuthenticatedUser {
  const claims = keycloak.tokenParsed as
    | { name?: string; preferred_username?: string; email?: string }
    | undefined;
  return {
    id: me.id,
    username: me.username,
    roles: me.roles,
    name: claims?.name ?? claims?.preferred_username ?? me.username,
    email: claims?.email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    initKeycloak()
      .then(async (authenticated) => {
        if (cancelled) return;
        if (authenticated) {
          const me = await getMe();
          if (!cancelled) setUser(buildUser(me));
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Falha ao inicializar a sessão do Keycloak:', error);
        setInitError('Não foi possível validar sua sessão. Tente novamente.');
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });

    keycloak.onAuthLogout = () => setUser(null);
    keycloak.onAuthError = () => setInitError('Não foi possível validar sua sessão. Tente novamente.');
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.login());
    };

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      initError,
      signIn: () => keycloak.login(),
      signOut: () => keycloak.logout({ redirectUri: window.location.origin }),
    }),
    [user, isInitializing, initError],
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
