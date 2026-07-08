import { Alert, Box, Button, Group, Loader, Paper, SimpleGrid, Text } from '@mantine/core';
import { IconAlertCircle, IconFileTypePdf, IconFileSpreadsheet, IconPrinter } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useAllProperties } from '@/entities/property/property.hooks';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { downloadCsv } from '@/shared/lib/export-csv';
import { formatCurrency, formatDate, formatNumber } from '@/shared/lib/format';
import { aggregateProperties, distributionByCategory, distributionByPossession } from '@/shared/lib/property-stats';
import { PAGE_GUTTER_X } from '@/shared/ui/layout-constants';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PropertyTable } from '@/features/property-list/PropertyTable';
import { applyReportFilters, initialReportFilterState } from '@/features/reports/reports-filters';
import { ReportFilters } from '@/features/reports/ReportFilters';
import { HorizontalDistributionChart } from '@/features/reports/HorizontalDistributionChart';

export function ReportsPage() {
  const { data: properties, isLoading, isError, error } = useAllProperties();
  const [filters, setFilters] = useState(initialReportFilterState);

  const filtered = useMemo(() => applyReportFilters(properties ?? [], filters), [properties, filters]);
  const aggregates = useMemo(() => aggregateProperties(filtered), [filtered]);
  const categoryDistribution = useMemo(() => distributionByCategory(filtered), [filtered]);
  const possessionDistribution = useMemo(() => distributionByPossession(filtered), [filtered]);

  const handleExportCsv = () => {
    downloadCsv(
      `sicim-relatorio-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((property) => ({
        matricula: property.registrationNumber,
        descricao: property.notarialDescription,
        endereco: `${property.address.street}, ${property.address.number} - ${property.address.neighborhood}`,
        categoria: property.usageCategory,
        posse: property.possessionType,
        areaTotal: property.totalArea,
        areaConstruida: property.builtArea,
        valorOriginal: property.originalValue,
        depreciacaoAcumulada: property.accumulatedDepreciation,
        valorLiquido: property.netBookValue,
        status: property.status,
      })),
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Gestão / Relatórios"
        title={
          <>
            Relatórios <span style={{ color: "#1A5C2A", fontWeight: 600 }}>patrimoniais</span> e contábeis
          </>
        }
        subtitle="Gere relatórios consolidados do patrimônio imobiliário municipal. Personalize filtros e exporte em PDF, Excel ou impressão."
      />

      <Box p={`20px ${PAGE_GUTTER_X}px 48px`}>
        {isError && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Não foi possível carregar os imóveis" mb="md">
            {extractErrorMessage(error)}
          </Alert>
        )}

        <Box style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
          <ReportFilters value={filters} onChange={setFilters} />

          <Paper style={{ overflow: 'hidden' }}>
            <Box p="16px 20px" style={{ background: '#1A5C2A', color: '#fff' }}>
              <Text size="10px" tt="uppercase" c="rgba(255,255,255,0.5)" mb={6} style={{ letterSpacing: 2 }}>
                Relatório Patrimonial Consolidado
              </Text>
              <Text fw={700} mb={4} style={{ fontSize: 18 }}>
                Patrimônio Imobiliário — Crateús/CE
              </Text>
              <Text size="12px" c="rgba(255,255,255,0.7)" ff="monospace">
                Gerado em {formatDate(new Date())} · {filtered.length} imóveis
              </Text>
            </Box>

            {isLoading ? (
              <Group justify="center" p="xl">
                <Loader size="sm" />
              </Group>
            ) : (
              <>
                <SimpleGrid cols={4} spacing={0} bg="#F2F2F2" style={{ borderBottom: '1px solid #e0e0e0' }}>
                  {[
                    { label: 'Imóveis', value: formatNumber(aggregates.count) },
                    { label: 'Área Total', value: `${formatNumber(aggregates.totalArea)} m²` },
                    { label: 'Valor Original', value: formatCurrency(aggregates.originalValue) },
                    { label: 'Valor Líquido', value: formatCurrency(aggregates.netBookValue) },
                  ].map((stat, index) => (
                    <Box key={stat.label} p="12px 16px" style={{ borderRight: index < 3 ? '1px solid #ededed' : undefined }}>
                      <Text size="10px" tt="uppercase" c="dimmed" mb={4} style={{ letterSpacing: 1.5 }}>
                        {stat.label}
                      </Text>
                      <Text fw={700} style={{ fontSize: 17 }}>
                        {stat.value}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>

                <HorizontalDistributionChart title="Distribuição por Categoria de Uso" rows={categoryDistribution} />
                <HorizontalDistributionChart title="Distribuição por Tipo de Posse" rows={possessionDistribution} />

                <Group justify="space-between" p="18px 28px" style={{ background: '#E8F3EB', borderTop: '1px solid #cfdcd5' }} className="no-print">
                  <Text size="12.5px" c="#1A5C2A">
                    Exportar <Text component="strong" fw={600} span>{filtered.length} registros</Text> nos formatos abaixo
                  </Text>
                  <Group gap={8}>
                    <Button variant="default" size="xs" leftSection={<IconFileTypePdf size={14} />} onClick={() => window.print()}>
                      PDF
                    </Button>
                    <Button variant="default" size="xs" leftSection={<IconFileSpreadsheet size={14} />} onClick={handleExportCsv}>
                      Excel (CSV)
                    </Button>
                    <Button color="brandGreen" size="xs" leftSection={<IconPrinter size={14} />} onClick={() => window.print()}>
                      Imprimir
                    </Button>
                  </Group>
                </Group>

                <PropertyTable properties={filtered} onSelect={() => {}} />
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
}
