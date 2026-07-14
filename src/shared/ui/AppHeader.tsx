import { ActionIcon, Avatar, Box, CloseButton, Group, Popover, Text, TextInput, Tooltip, UnstyledButton } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { IconLogout, IconMapPin, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/entities/auth/auth-context';
import { useAllProperties } from '@/entities/property/property.hooks';
import type { Property } from '@/entities/property/property.types';
import { matchesSearch } from '@/features/property-list/property-filters';
import { useSearch } from '@/shared/lib/search-context';
import { roleLabels } from '@/shared/types/enums';
import { HEADER_ACCENT_HEIGHT, PAGE_GUTTER_X, RADIUS_MD } from './layout-constants';
import { navItems } from './nav-items';

const SUGGESTION_LIMIT = 6;

// Rola mais que isso e o header encolhe: a faixa branca (marca + busca + usuário)
// recolhe e a barra verde de navegação absorve marca e ações do usuário numa única
// faixa compacta, para sobrar mais espaço vertical de conteúdo.
const SCROLL_COLLAPSE_THRESHOLD = 48;

const TRANSITION = 'all 0.22s ease';

function NavRow({ compact }: { compact: boolean }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box
      style={{
        background: '#1A5C2A',
        display: 'flex',
        alignItems: 'center',
        padding: compact ? `6px ${PAGE_GUTTER_X}px` : '2px 0',
        transition: TRANSITION,
      }}
    >
      {/* Marca — só aparece quando o header está compacto (a faixa branca some) */}
      <Box
        style={{
          maxWidth: compact ? 160 : 0,
          opacity: compact ? 1 : 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginRight: compact ? 20 : 0,
          transition: TRANSITION,
        }}
      >
        <Text size="14px" fw={700} c="#fff">
          SICIM
        </Text>
      </Box>

      <Group justify="center" gap={4} wrap="wrap" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const itemStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: compact ? '6px 10px' : '10px 14px',
            fontSize: compact ? 12 : 13,
            fontWeight: 500,
            color: active ? '#fff' : 'rgba(232,239,233,0.75)',
            opacity: item.disabled ? 0.4 : 1,
            cursor: item.disabled ? 'default' : 'pointer',
            borderBottom: active ? '2px solid #F5D000' : '2px solid transparent',
            transition: TRANSITION,
          } as const;

          if (item.disabled) {
            return (
              <UnstyledButton key={item.label} data-disabled style={itemStyle}>
                <item.icon size={compact ? 13 : 15} stroke={2} />
                {item.label}
              </UnstyledButton>
            );
          }

          return (
            <UnstyledButton key={item.label} component={NavLink} to={item.to} style={itemStyle}>
              <item.icon size={compact ? 13 : 15} stroke={2} />
              {item.label}
            </UnstyledButton>
          );
        })}
      </Group>

      {/* Ações do usuário — idem, só aparecem quando compacto */}
      <Group
        gap={8}
        wrap="nowrap"
        style={{
          maxWidth: compact ? 160 : 0,
          opacity: compact ? 1 : 0,
          overflow: 'hidden',
          marginLeft: compact ? 20 : 0,
          transition: TRANSITION,
        }}
      >
        <Avatar radius="xl" size={26} color="brandGold" variant="gradient" gradient={{ from: '#C8A84B', to: '#a08838' }}>
          <Text size="10.5px" fw={700} c="#fff">
            {initials ?? '—'}
          </Text>
        </Avatar>
        <Tooltip label="Sair">
          <ActionIcon variant="subtle" color="gray.0" size={28} onClick={signOut} aria-label="Sair">
            <IconLogout size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}

export function AppHeader() {
  const [{ y }] = useWindowScroll();
  const { user, signOut } = useAuth();
  const { query, setQuery } = useSearch();
  const { data: properties } = useAllProperties();
  const [suggestionsOpened, setSuggestionsOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const compact = y > SCROLL_COLLAPSE_THRESHOLD;

  const suggestions = useMemo(() => {
    const list = properties ?? [];
    const normalized = query.trim();
    const matched = normalized
      ? list.filter((property) => matchesSearch(property, normalized))
      : [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return matched.slice(0, SUGGESTION_LIMIT);
  }, [properties, query]);

  const goToSearchablePage = () => {
    const searchablePages = ['/', '/relatorios'];
    if (!searchablePages.includes(location.pathname)) {
      navigate('/');
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (value.trim()) goToSearchablePage();
  };

  const handleSelectSuggestion = (property: Property) => {
    setQuery(property.registrationNumber);
    setSuggestionsOpened(false);
    goToSearchablePage();
  };

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Barra de destaque */}
      <Box
        style={{
          height: compact ? 0 : HEADER_ACCENT_HEIGHT,
          background: '#1A5C2A',
          overflow: 'hidden',
          transition: TRANSITION,
        }}
      />

      {/* Faixa branca — marca do sistema + busca + usuário (recolhe ao rolar) */}
      <Box
        style={{
          background: '#fff',
          borderBottom: compact ? 'none' : '1px solid #e0e0e0',
          padding: compact ? `0 ${PAGE_GUTTER_X}px` : `10px ${PAGE_GUTTER_X}px`,
          maxHeight: compact ? 0 : 64,
          opacity: compact ? 0 : 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          transition: TRANSITION,
        }}
      >
        <Box>
          <Text size="18px" fw={700} c="#1A5C2A" style={{ lineHeight: 1 }}>
            SICIM
          </Text>
          <Text size="10px" tt="uppercase" c="dimmed" style={{ letterSpacing: 1.5 }}>
            Crateús · Ceará
          </Text>
        </Box>

        <Popover
          opened={suggestionsOpened}
          onChange={setSuggestionsOpened}
          width="target"
          position="bottom-start"
          shadow="md"
          offset={4}
          withinPortal
        >
          <Popover.Target>
            <TextInput
              placeholder="Buscar por matrícula, endereço, cartório..."
              leftSection={<IconSearch size={14} />}
              rightSection={
                query ? <CloseButton size="sm" onClick={() => setQuery('')} aria-label="Limpar busca" /> : null
              }
              value={query}
              onChange={(event) => handleSearchChange(event.currentTarget.value)}
              onFocus={() => setSuggestionsOpened(true)}
              radius="md"
              style={{ flex: 1, maxWidth: 420 }}
            />
          </Popover.Target>
          <Popover.Dropdown p={6}>
            {suggestions.length === 0 ? (
              <Text size="xs" c="dimmed" p="10px 8px">
                Nenhum imóvel encontrado.
              </Text>
            ) : (
              <>
                {!query.trim() && (
                  <Text size="10px" tt="uppercase" c="dimmed" p="4px 8px" style={{ letterSpacing: 1 }}>
                    Cadastros recentes
                  </Text>
                )}
                {suggestions.map((property) => (
                  <UnstyledButton
                    key={property.id}
                    onClick={() => handleSelectSuggestion(property)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px', borderRadius: RADIUS_MD }}
                    className="suggestion-item"
                  >
                    <IconMapPin size={14} color="#1A5C2A" style={{ flexShrink: 0 }} />
                    <Box style={{ minWidth: 0, flex: 1 }}>
                      <Text size="xs" fw={600} truncate>
                        {property.notarialDescription}
                      </Text>
                      <Text size="10.5px" c="dimmed" ff="monospace" truncate>
                        {property.registrationNumber} · {property.address.street}, {property.address.number}
                      </Text>
                    </Box>
                  </UnstyledButton>
                ))}
              </>
            )}
          </Popover.Dropdown>
        </Popover>

        <Group gap={10}>
          <Box style={{ textAlign: 'right' }}>
            <Text size="13px" fw={600} truncate maw={160}>
              {user?.name ?? 'Usuário'}
            </Text>
            <Text size="11px" c="dimmed">
              {user ? roleLabels[user.role] : ''}
            </Text>
          </Box>
          <Avatar radius="xl" size={36} color="brandGold" variant="gradient" gradient={{ from: '#C8A84B', to: '#a08838' }}>
            <Text size="13px" fw={700} c="#fff">
              {initials ?? '—'}
            </Text>
          </Avatar>
          <Tooltip label="Sair">
            <ActionIcon variant="default" size={36} radius={RADIUS_MD} onClick={signOut} aria-label="Sair">
              <IconLogout size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>

      {/* Faixa verde — navegação centralizada, absorve marca/usuário quando compacta */}
      <NavRow compact={compact} />
    </Box>
  );
}
