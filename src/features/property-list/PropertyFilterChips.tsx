import { Group, Select } from '@mantine/core';
import { useMemo } from 'react';
import type { Property } from '@/entities/property/property.types';
import { possessionTypeLabels, usageCategoryLabels, type PossessionType, type UsageCategory } from '@/shared/types/enums';
import type { TableFilterState } from './property-filters';

function countBy<T extends string>(properties: Property[], keyOf: (p: Property) => T): Map<T, number> {
  const map = new Map<T, number>();
  for (const property of properties) {
    const key = keyOf(property);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export function PropertyFilterChips({
  properties,
  value,
  onChange,
}: {
  properties: Property[];
  value: TableFilterState;
  onChange: (value: TableFilterState) => void;
}) {
  const byCategory = countBy(properties, (p) => p.usageCategory as UsageCategory);
  const byPossession = countBy(properties, (p) => p.possessionType as PossessionType);

  const categoryOptions = useMemo(
    () => [
      { value: 'ALL', label: `Todas as categorias (${properties.length})` },
      ...(Object.keys(usageCategoryLabels) as UsageCategory[]).map((category) => ({
        value: category,
        label: `${usageCategoryLabels[category]} (${byCategory.get(category) ?? 0})`,
      })),
    ],
    [properties.length, byCategory],
  );

  const possessionOptions = useMemo(
    () => [
      { value: 'ALL', label: `Todos os tipos de posse (${properties.length})` },
      ...(Object.keys(possessionTypeLabels) as PossessionType[]).map((possession) => ({
        value: possession,
        label: `${possessionTypeLabels[possession]} (${byPossession.get(possession) ?? 0})`,
      })),
    ],
    [properties.length, byPossession],
  );

  return (
    <Group gap="sm" py="sm" wrap="wrap">
      <Select
        aria-label="Filtrar por categoria de uso"
        data={categoryOptions}
        value={value.category}
        onChange={(category) => category && onChange({ ...value, category: category as UsageCategory | 'ALL' })}
        w={220}
        size="xs"
        allowDeselect={false}
      />
      <Select
        aria-label="Filtrar por tipo de posse"
        data={possessionOptions}
        value={value.possession}
        onChange={(possession) => possession && onChange({ ...value, possession: possession as PossessionType | 'ALL' })}
        w={220}
        size="xs"
        allowDeselect={false}
      />
    </Group>
  );
}
