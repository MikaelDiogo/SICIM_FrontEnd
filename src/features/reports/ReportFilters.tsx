import { Box, Checkbox, NumberInput, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { useManagingUnits } from '@/entities/managing-unit/managing-unit.hooks';
import { propertyStatusLabels, usageCategoryLabels, type PropertyStatus, type UsageCategory } from '@/shared/types/enums';
import { toggle, type ReportFilterState } from './reports-filters';

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box p="18px 22px" style={{ borderBottom: '1px solid #ededed' }}>
      <Text fw={700} size="sm" mb={10}>
        {title}
      </Text>
      {children}
    </Box>
  );
}

export function ReportFilters({
  value,
  onChange,
}: {
  value: ReportFilterState;
  onChange: (value: ReportFilterState) => void;
}) {
  const { data: managingUnits } = useManagingUnits();

  return (
    <Paper style={{ position: 'sticky', top: 90, overflow: 'hidden' }}>
      <FilterSection title="Categoria de Uso">
        <Stack gap={8}>
          {(Object.keys(usageCategoryLabels) as UsageCategory[]).map((category) => (
            <Checkbox
              key={category}
              label={usageCategoryLabels[category]}
              checked={value.categories.includes(category)}
              onChange={() => onChange({ ...value, categories: toggle(value.categories, category) })}
            />
          ))}
        </Stack>
      </FilterSection>

      <FilterSection title="Status">
        <Stack gap={8}>
          {(Object.keys(propertyStatusLabels) as PropertyStatus[]).map((status) => (
            <Checkbox
              key={status}
              label={propertyStatusLabels[status]}
              checked={value.statuses.includes(status)}
              onChange={() => onChange({ ...value, statuses: toggle(value.statuses, status) })}
            />
          ))}
        </Stack>
      </FilterSection>

      <FilterSection title="Unidade Gestora">
        <Stack gap={8}>
          {(managingUnits ?? []).map((unit) => (
            <Checkbox
              key={unit.id}
              label={unit.acronym}
              checked={value.managingUnitIds.includes(unit.id)}
              onChange={() => onChange({ ...value, managingUnitIds: toggle(value.managingUnitIds, unit.id) })}
            />
          ))}
        </Stack>
      </FilterSection>

      <FilterSection title="Ano de Aquisição">
        <SimpleGrid cols={2}>
          <NumberInput
            label="De"
            placeholder="1990"
            value={value.acquisitionYearFrom}
            onChange={(v) => onChange({ ...value, acquisitionYearFrom: typeof v === 'number' ? v : undefined })}
          />
          <NumberInput
            label="Até"
            placeholder="2026"
            value={value.acquisitionYearTo}
            onChange={(v) => onChange({ ...value, acquisitionYearTo: typeof v === 'number' ? v : undefined })}
          />
        </SimpleGrid>
      </FilterSection>
    </Paper>
  );
}
