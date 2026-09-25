import { Alert, Box, Button, Drawer, Group, Loader, Paper, Select, Text } from '@mantine/core';
import { IconAlertCircle, IconDownload } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useAllProperties } from '@/entities/property/property.hooks';
import type { Property } from '@/entities/property/property.types';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { formatCurrency } from '@/shared/lib/format';
import { aggregateProperties } from '@/shared/lib/property-stats';
import { usageCategoryLabels, type UsageCategory } from '@/shared/types/enums';
import { PAGE_GUTTER_X } from '@/shared/ui/layout-constants';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PropertyMap } from '@/features/map/PropertyMap';
import { PropertyDetailAside } from '@/features/property-list/PropertyDetailAside';

// AppHeader (expandido) + PageHeader — travamos a página em 1 tela (sem scroll) pra evitar
// que o recolhimento do header ao rolar desalinhe o canvas do MapLibre no meio do caminho.
const CHROME_HEIGHT = 224;

export function MapPage() {
  const { data: properties, isLoading, isError, error } = useAllProperties();
  const [category, setCategory] = useState<UsageCategory | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Property | null>(null);

  const filtered = useMemo(
    () => (properties ?? []).filter((p) => category === 'ALL' || p.usageCategory === category),
    [properties, category],
  );
  const aggregates = useMemo(() => aggregateProperties(filtered), [filtered]);

  return (
    <>
      <PageHeader
        eyebrow="Geolocalização / Mapa Territorial"
        title={
          <>
            Mapa <span style={{ color: "#1A5C2A", fontWeight: 600 }}>territorial</span> dos imóveis municipais
          </>
        }
      />

      <Box
        style={{
          height: `calc(100vh - ${CHROME_HEIGHT}px)`,
          minHeight: 480,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflow: 'hidden',
          padding: `20px ${PAGE_GUTTER_X}px 24px`,
        }}
      >
        {isError && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Não foi possível carregar os imóveis">
            {extractErrorMessage(error)}
          </Alert>
        )}

        <Paper p="14px 20px">
          <Group justify="space-between" wrap="wrap">
            <Group gap={20} wrap="wrap">
              <Box>
                <Text size="10px" tt="uppercase" c="dimmed" mb={4} style={{ letterSpacing: 1.5 }}>
                  Exibindo
                </Text>
                <Text fw={500} style={{ fontSize: 18 }}>
                  {isLoading ? <Loader size="xs" /> : `${filtered.length} imóveis`}
                </Text>
              </Box>
              <Box>
                <Text size="10px" tt="uppercase" c="dimmed" mb={4} style={{ letterSpacing: 1.5 }}>
                  Valor agregado
                </Text>
                <Text fw={500} style={{ fontSize: 18 }}>
                  {isLoading ? <Loader size="xs" /> : formatCurrency(aggregates.netBookValue)}
                </Text>
              </Box>
              <Select
                aria-label="Filtrar por categoria de uso"
                value={category}
                onChange={(v) => v && setCategory(v as UsageCategory | 'ALL')}
                data={[
                  { value: 'ALL', label: 'Todas as categorias' },
                  ...(Object.keys(usageCategoryLabels) as UsageCategory[]).map((c) => ({
                    value: c,
                    label: usageCategoryLabels[c],
                  })),
                ]}
                w={200}
                size="xs"
                allowDeselect={false}
              />
            </Group>
            <Button variant="default" size="xs" leftSection={<IconDownload size={13} />}>
              Exportar Mapa
            </Button>
          </Group>
        </Paper>

        <Paper style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <PropertyMap properties={filtered} height="100%" onSelect={setSelected} fitToMarkers />
        </Paper>
      </Box>

      <Drawer opened={selected !== null} onClose={() => setSelected(null)} position="right" size="420px" title="Ficha do Imóvel" padding={0}>
        <PropertyDetailAside property={selected} />
      </Drawer>
    </>
  );
}
