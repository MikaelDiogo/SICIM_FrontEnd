import { apiClient } from '@/shared/lib/api-client';
import type { ListPropertyHistoryFilters, PropertyHistoryPage } from './property-history.types';

// GET /property-history — auditoria geral, só ADMIN (ver API.md).
export async function listPropertyHistory(filters: ListPropertyHistoryFilters = {}): Promise<PropertyHistoryPage> {
  const { data } = await apiClient.get<PropertyHistoryPage>('/property-history', { params: filters });
  return data;
}

// GET /properties/{id}/history — histórico de um imóvel específico, só ADMIN.
export async function listPropertyHistoryForProperty(
  propertyId: string,
  page = 1,
  pageSize = 20,
): Promise<PropertyHistoryPage> {
  const { data } = await apiClient.get<PropertyHistoryPage>(`/properties/${propertyId}/history`, {
    params: { page, pageSize },
  });
  return data;
}
