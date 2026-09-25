import { useQuery } from '@tanstack/react-query';
import { listPropertyHistory, listPropertyHistoryForProperty } from './property-history.api';
import type { ListPropertyHistoryFilters } from './property-history.types';

export const propertyHistoryKeys = {
  list: (filters: ListPropertyHistoryFilters) => ['property-history', 'list', filters] as const,
  forProperty: (propertyId: string, page: number) => ['property-history', 'property', propertyId, page] as const,
};

export function usePropertyHistory(filters: ListPropertyHistoryFilters) {
  return useQuery({
    queryKey: propertyHistoryKeys.list(filters),
    queryFn: () => listPropertyHistory(filters),
    placeholderData: (previous) => previous,
  });
}

export function usePropertyHistoryForProperty(propertyId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: propertyHistoryKeys.forProperty(propertyId ?? '', page),
    queryFn: () => listPropertyHistoryForProperty(propertyId!, page, pageSize),
    enabled: Boolean(propertyId),
    placeholderData: (previous) => previous,
  });
}
