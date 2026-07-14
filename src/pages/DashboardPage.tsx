import { Alert, Box, Button, Group, Loader, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconMaximize, IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllProperties } from '@/entities/property/property.hooks';
import type { Property } from '@/entities/property/property.types';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { aggregateProperties } from '@/shared/lib/property-stats';
import { KpiCard } from '@/shared/ui/KpiCard';
import { PAGE_GUTTER_X } from '@/shared/ui/layout-constants';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PropertyMap } from '@/features/map/PropertyMap';
import { applyTableFilters, initialTableFilterState } from '@/features/property-list/property-filters';
import { PropertyDetailAside } from '@/features/property-list/PropertyDetailAside';
import { PropertyFilterChips } from '@/features/property-list/PropertyFilterChips';
import { PropertyTable } from '@/features/property-list/PropertyTable';
import { useSearch } from '@/shared/lib/search-context';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: properties, isLoading, isError, error } = useAllProperties();
  const [filters, setFilters] = useState(initialTableFilterState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { query } = useSearch();

  const filtered = useMemo(
    () => applyTableFilters(properties ?? [], filters, query),
    [properties, filters, query],
  );
  const aggregates = useMemo(() => aggregateProperties(properties ?? []), [properties]);
  const selected: Property | null =
    filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Sistema de Controle de Imóveis Municipais"
        title={
          <>
            Patrimônio <span style={{ color: "#1A5C2A", fontWeight: 600 }}>imobiliário</span> da municipalidade
          </>
        }
      />

      {isError && (
        <Box p="xl">
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Não foi possível carregar os imóveis">
            {extractErrorMessage(error)}
          </Alert>
        </Box>
      )}

      {!isError && (
        <Box p={`18px ${PAGE_GUTTER_X}px 0`}>
          <SimpleGrid cols={4} spacing={12}>
            <KpiCard label="Imóveis Cadastrados" value={isLoading ? <Loader size="sm" /> : formatNumber(aggregates.count)} trend="Total no sistema" />
            <KpiCard
              label="Valor Patrimonial Total"
              value={isLoading ? <Loader size="sm" /> : formatCurrency(aggregates.netBookValue)}
              trend="Valor líquido atual"
            />
            <KpiCard
              label="Área Construída Total"
              value={isLoading ? <Loader size="sm" /> : `${formatNumber(aggregates.builtArea)} m²`}
              trend={`${formatNumber(aggregates.count)} unidades`}
            />
            <KpiCard
              label="Depreciação Acumulada"
              value={isLoading ? <Loader size="sm" /> : formatCurrency(aggregates.accumulatedDepreciation)}
              trend={
                aggregates.originalValue > 0
                  ? `${((aggregates.accumulatedDepreciation / aggregates.originalValue) * 100).toFixed(2)}% do valor original`
                  : undefined
              }
            />
          </SimpleGrid>
        </Box>
      )}

      <Box style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, padding: `20px ${PAGE_GUTTER_X}px 48px` }}>
        <Stack gap={20}>
          <Paper style={{ overflow: 'hidden' }}>
            <Group justify="space-between" p="14px 20px" style={{ borderBottom: '1px solid #e0e0e0' }}>
              <Box>
                <Text fw={700} style={{ fontSize: 15 }}>
                  Mapa Territorial
                </Text>
              </Box>
              <Button variant="default" size="xs" leftSection={<IconMaximize size={14} />} onClick={() => navigate('/mapa')}>
                Tela cheia
              </Button>
            </Group>
            <PropertyMap properties={properties ?? []} onSelect={(p) => setSelectedId(p.id)} />
          </Paper>

          <Paper style={{ overflow: 'hidden' }}>
            <Group justify="space-between" p="14px 20px" style={{ borderBottom: '1px solid #e0e0e0' }}>
              <Box>
                <Text fw={700} style={{ fontSize: 15 }}>
                  {query.trim() ? `Resultados da busca (${filtered.length})` : 'Imóveis Recentes'}
                </Text>
              </Box>
              <Button color="brandGreen" size="xs" leftSection={<IconPlus size={13} />} onClick={() => navigate('/imoveis/novo')}>
                Novo Imóvel
              </Button>
            </Group>
            <Box px="20px" style={{ borderBottom: '1px solid #e0e0e0', background: '#F2F2F2' }}>
              <PropertyFilterChips properties={properties ?? []} value={filters} onChange={setFilters} />
            </Box>
            {isLoading ? (
              <Group justify="center" p="xl">
                <Loader size="sm" />
              </Group>
            ) : (
              <PropertyTable
                properties={query.trim() ? filtered : filtered.slice(0, 20)}
                selectedId={selected?.id}
                onSelect={(p) => setSelectedId(p.id)}
              />
            )}
          </Paper>
        </Stack>

        <Box>
          <PropertyDetailAside property={selected} />
        </Box>
      </Box>
    </>
  );
}
