import { apiClient, correlationHeader, newCorrelationId } from '@/shared/lib/api-client';
import type {
  ListPropertiesFilters,
  PagedResult,
  Property,
  RegisterPropertyInput,
  UpdatePropertyInput,
} from './property.types';

export async function listProperties(filters: ListPropertiesFilters = {}): Promise<PagedResult<Property>> {
  const { data } = await apiClient.get<PagedResult<Property>>('/properties', { params: filters });
  return data;
}

export async function getProperty(id: string): Promise<Property> {
  const { data } = await apiClient.get<Property>(`/properties/${id}`);
  return data;
}

export async function registerProperty(
  input: RegisterPropertyInput,
  correlationId = newCorrelationId(),
): Promise<Property> {
  const { data } = await apiClient.post<Property>('/properties', input, {
    headers: correlationHeader(correlationId),
  });
  return data;
}

export async function updateProperty(
  id: string,
  input: UpdatePropertyInput,
  correlationId = newCorrelationId(),
): Promise<Property> {
  const { data } = await apiClient.patch<Property>(`/properties/${id}`, input, {
    headers: correlationHeader(correlationId),
  });
  return data;
}

export async function approveProperty(id: string, correlationId = newCorrelationId()): Promise<Property> {
  const { data } = await apiClient.patch<Property>(
    `/properties/${id}/approve`,
    undefined,
    { headers: correlationHeader(correlationId) },
  );
  return data;
}

export async function deactivateProperty(id: string, correlationId = newCorrelationId()): Promise<Property> {
  const { data } = await apiClient.patch<Property>(
    `/properties/${id}/deactivate`,
    undefined,
    { headers: correlationHeader(correlationId) },
  );
  return data;
}

export async function recalculateDepreciation(
  id: string,
  correlationId = newCorrelationId(),
): Promise<Property> {
  const { data } = await apiClient.patch<Property>(
    `/properties/${id}/recalculate-depreciation`,
    undefined,
    { headers: correlationHeader(correlationId) },
  );
  return data;
}

export async function listCustomCategories(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/properties/custom-categories');
  return data;
}
