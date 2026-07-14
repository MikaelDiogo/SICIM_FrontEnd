import { Box, Paper, Stack, Title } from '@mantine/core';
import { LoginForm } from '@/features/auth/LoginForm';

export function LoginPage() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #1A5C2A 0%, #2D8A3E 100%)',
        padding: 24,
      }}
    >
      <Paper radius="md" p="xl" w={400} shadow="lg">
        <Stack align="center" gap={4} mb="lg">
          <Title order={1} style={{ fontSize: 24 }}>
            SICIM
          </Title>
        </Stack>
        <LoginForm />
      </Paper>
    </Box>
  );
}
