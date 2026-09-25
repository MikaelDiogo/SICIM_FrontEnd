import { useEffect, type ReactNode } from 'react';
import { Box, Button, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '@/entities/auth/auth-context';

// Evita loop de redirecionamento: só tenta signIn() automaticamente uma vez por sessão de
// navegador. Se voltar do Keycloak ainda sem sessão válida, mostra erro em vez de redirecionar de novo.
const REDIRECT_GUARD_KEY = 'sicim.authRedirectAttempted';

function Centered({ children }: { children: ReactNode }) {
  return (
    <Box style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>{children}</Box>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, initError, signIn } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.removeItem(REDIRECT_GUARD_KEY);
      return;
    }
    if (!isInitializing && !initError) {
      if (sessionStorage.getItem(REDIRECT_GUARD_KEY)) return;
      sessionStorage.setItem(REDIRECT_GUARD_KEY, '1');
      signIn();
    }
  }, [isInitializing, isAuthenticated, initError, signIn]);

  if (initError || (!isInitializing && !isAuthenticated && sessionStorage.getItem(REDIRECT_GUARD_KEY))) {
    return (
      <Centered>
        <Stack align="center" gap="sm" maw={360} ta="center">
          <Text fw={600}>Não foi possível entrar</Text>
          <Text size="sm" c="dimmed">
            {initError ?? 'A sessão não foi validada após o login. Tente novamente.'}
          </Text>
          <Button
            color="brandGreen"
            onClick={() => {
              sessionStorage.removeItem(REDIRECT_GUARD_KEY);
              window.location.reload();
            }}
          >
            Tentar novamente
          </Button>
        </Stack>
      </Centered>
    );
  }

  if (isInitializing || !isAuthenticated) {
    return (
      <Centered>
        <Loader color="brandGreen" />
      </Centered>
    );
  }

  return children;
}
