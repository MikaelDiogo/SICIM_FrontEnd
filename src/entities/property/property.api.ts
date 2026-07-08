import { apiClient } from '@/shared/lib/api-client';
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

export async function registerProperty(input: RegisterPropertyInput): Promise<Property> {
  const { data } = await apiClient.post<Property>('/properties', input);
  return data;
}

export async function updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
  const { data } = await apiClient.patch<Property>(`/properties/${id}`, input);
  return data;
}

export async function approveProperty(id: string): Promise<Property> {
  const { data } = await apiClient.patch<Property>(`/properties/${id}/approve`);
  return data;
}

export async function deactivateProperty(id: string): Promise<Property> {
  const { data } = await apiClient.patch<Property>(`/properties/${id}/deactivate`);
  return data;
}

export async function recalculateDepreciation(id: string): Promise<Property> {
  const { data } = await apiClient.patch<Property>(`/properties/${id}/recalculate-depreciation`);
  return data;
}
