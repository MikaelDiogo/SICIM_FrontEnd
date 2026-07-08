import type { Property } from '@/entities/property/property.types';
import type { PossessionType, UsageCategory } from '@/shared/types/enums';

export interface TableFilterState {
  category: UsageCategory | 'ALL';
  possession: PossessionType | 'ALL';
}

export const initialTableFilterState: TableFilterState = { category: 'ALL', possession: 'ALL' };

export function applyTableFilters(properties: Property[], filters: TableFilterState): Property[] {
  return properties.filter((property) => {
    if (filters.category !== 'ALL' && property.usageCategory !== filters.category) return false;
    if (filters.possession !== 'ALL' && property.possessionType !== filters.possession) return false;
    return true;
  });
}
