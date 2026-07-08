import { Box } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export function AppLayout() {
  return (
    <Box style={{ minHeight: '100vh', background: '#F2F2F2' }}>
      <AppHeader />
      {/* Só esta área troca de conteúdo ao navegar — o header acima permanece montado. */}
      <Outlet />
    </Box>
  );
}
