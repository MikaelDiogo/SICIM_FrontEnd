import { ActionIcon, Box, Group, Text, TextInput, Tooltip } from '@mantine/core';
import { IconLogout, IconSearch } from '@tabler/icons-react';
import { useAuth } from '@/entities/auth/auth-context';

export function Topbar({ breadcrumb }: { breadcrumb: string }) {
  const { signOut } = useAuth();

  return (
    <Box
      style={{
        background: '#fff',
        padding: '18px 40px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Text size="12px" tt="uppercase" c="dimmed" style={{ letterSpacing: 1.5 }}>
        Patrimônio Municipal / <Text component="strong" c="black" fw={600}>{breadcrumb}</Text>
      </Text>
      <Group gap="14px">
        <TextInput
          placeholder="Buscar por matrícula, endereço, cartório..."
          leftSection={<IconSearch size={14} />}
          w={320}
          radius="sm"
        />
        <Tooltip label="Sair">
          <ActionIcon variant="default" size={36} onClick={signOut} aria-label="Sair">
            <IconLogout size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}
