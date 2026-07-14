import type { Property } from '@/entities/property/property.types';
import { matchesSearch } from '@/features/property-list/property-filters';
import type { PropertyStatus, UsageCategory } from '@/shared/types/enums';

export interface ReportFilterState {
  categories: UsageCategory[];
  statuses: PropertyStatus[];
  managingUnitIds: string[];
  acquisitionYearFrom?: number;
  acquisitionYearTo?: number;
}

export const initialReportFilterState: ReportFilterState = {
  categories: [],
  statuses: [],
  managingUnitIds: [],
};

export function applyReportFilters(properties: Property[], filters: ReportFilterState, search = ''): Property[] {
  return properties.filter((property) => {
    if (filters.categories.length > 0 && !filters.categories.includes(property.usageCategory)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(property.status)) return false;
    if (filters.managingUnitIds.length > 0 && !filters.managingUnitIds.includes(property.managingUnitId)) return false;
    if (filters.acquisitionYearFrom && property.acquisitionYear < filters.acquisitionYearFrom) return false;
    if (filters.acquisitionYearTo && property.acquisitionYear > filters.acquisitionYearTo) return false;
    if (!matchesSearch(property, search)) return false;
    return true;
  });
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export { toggle };
