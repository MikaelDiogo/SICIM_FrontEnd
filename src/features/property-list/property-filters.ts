import type { Property } from '@/entities/property/property.types';
import type { PossessionType, UsageCategory } from '@/shared/types/enums';

export interface TableFilterState {
  category: UsageCategory | 'ALL';
  possession: PossessionType | 'ALL';
}

export const initialTableFilterState: TableFilterState = { category: 'ALL', possession: 'ALL' };

export function matchesSearch(property: Property, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    property.registrationNumber,
    property.notaryOffice,
    property.notarialDescription,
    property.address.street,
    property.address.number,
    property.address.neighborhood,
    property.address.zipCode,
  ].some((field) => field?.toLowerCase().includes(normalized));
}

export function applyTableFilters(properties: Property[], filters: TableFilterState, search = ''): Property[] {
  return properties.filter((property) => {
    if (filters.category !== 'ALL' && property.usageCategory !== filters.category) return false;
    if (filters.possession !== 'ALL' && property.possessionType !== filters.possession) return false;
    if (!matchesSearch(property, search)) return false;
    return true;
  });
}
