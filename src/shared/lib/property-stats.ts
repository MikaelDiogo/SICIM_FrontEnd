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

export function aggregateProperties(properties: Property[]): PropertyAggregates {
  return properties.reduce<PropertyAggregates>(
    (acc, property) => ({
      count: acc.count + 1,
      totalArea: acc.totalArea + property.totalArea,
      builtArea: acc.builtArea + property.builtArea,
      originalValue: acc.originalValue + property.originalValue,
      accumulatedDepreciation: acc.accumulatedDepreciation + property.accumulatedDepreciation,
      netBookValue: acc.netBookValue + property.netBookValue,
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

function buildDistribution<K extends string>(
  properties: Property[],
  keyOf: (property: Property) => K,
  labels: Record<K, string>,
): DistributionRow[] {
  const counts = new Map<string, number>();
  for (const property of properties) {
    const key = keyOf(property);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = properties.length || 1;
  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: labels[key as K] ?? key,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

export function distributionByCategory(properties: Property[]): DistributionRow[] {
  return buildDistribution(properties, (p) => p.usageCategory as UsageCategory, usageCategoryLabels);
}

export function distributionByPossession(properties: Property[]): DistributionRow[] {
  return buildDistribution(properties, (p) => p.possessionType as PossessionType, possessionTypeLabels);
}
