import { apiClient } from '@/shared/lib/api-client';
import type { ManagingUnit, RegisterManagingUnitInput } from './managing-unit.types';

export async function listManagingUnits(): Promise<ManagingUnit[]> {
  const { data } = await apiClient.get<ManagingUnit[]>('/managing-units');
  return data;
}

export async function getManagingUnit(id: string): Promise<ManagingUnit> {
  const { data } = await apiClient.get<ManagingUnit>(`/managing-units/${id}`);
  return data;
}

export async function registerManagingUnit(input: RegisterManagingUnitInput): Promise<ManagingUnit> {
  const { data } = await apiClient.post<ManagingUnit>('/managing-units', input);
  return data;
}
