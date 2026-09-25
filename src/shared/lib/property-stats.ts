import type { Property } from '@/entities/property/property.types';
import { possessionTypeLabels, usageCategoryLabels, type PossessionType, type UsageCategory } from '@/shared/types/enums';

export interface PropertyAggregates {
  count: number;
  totalArea: number;
  builtArea: number;
  originalValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
}

// Campos numéricos podem estar ausentes (ver REGRAS.md RN20) — imóveis incompletos contribuem
// com zero para os totais em vez de quebrar a agregação.
export function aggregateProperties(properties: Property[]): PropertyAggregates {
  return properties.reduce<PropertyAggregates>(
    (acc, property) => ({
      count: acc.count + 1,
      totalArea: acc.totalArea + (property.totalArea ?? 0),
      builtArea: acc.builtArea + (property.builtArea ?? 0),
      originalValue: acc.originalValue + (property.originalValue ?? 0),
      accumulatedDepreciation: acc.accumulatedDepreciation + (property.accumulatedDepreciation ?? 0),
      netBookValue: acc.netBookValue + (property.netBookValue ?? 0),
    }),
    { count: 0, totalArea: 0, builtArea: 0, originalValue: 0, accumulatedDepreciation: 0, netBookValue: 0 },
  );
}

export interface DistributionRow {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

const EMPTY_KEY = '__EMPTY__';

function buildDistribution<K extends string>(
  properties: Property[],
  keyOf: (property: Property) => K | null,
  labels: Record<K, string>,
  emptyLabel: string,
): DistributionRow[] {
  const counts = new Map<string, number>();
  for (const property of properties) {
    const key = keyOf(property) ?? EMPTY_KEY;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = properties.length || 1;
  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: key === EMPTY_KEY ? emptyLabel : (labels[key as K] ?? key),
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

export function distributionByCategory(properties: Property[]): DistributionRow[] {
  return buildDistribution(properties, (p) => p.usageCategory as UsageCategory | null, usageCategoryLabels, 'Sem categoria');
}

export function distributionByPossession(properties: Property[]): DistributionRow[] {
  return buildDistribution(properties, (p) => p.possessionType as PossessionType | null, possessionTypeLabels, 'Sem tipo de posse');
}
