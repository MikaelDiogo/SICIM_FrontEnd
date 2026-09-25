import { apiClient } from '@/shared/lib/api-client';
import type { CreateManagingUnitInput, ManagingUnit } from './managing-unit.types';

// Registro local de órgãos gestores mantido pelo próprio SICIM enquanto a API de organization
// da plataforma não existe (ver NOTA-TECNICA.md do sicim-bcm-module, item 2 — exceção
// documentada à regra 1.6 de REGRAS.md). RN17 valida managingUnitId contra este registro.
export async function listManagingUnits(): Promise<ManagingUnit[]> {
  const { data } = await apiClient.get<ManagingUnit[]>('/managing-units');
  return data;
}

export async function getManagingUnit(id: string): Promise<ManagingUnit | undefined> {
  const { data } = await apiClient.get<ManagingUnit>(`/managing-units/${id}`);
  return data;
}

export async function createManagingUnit(input: CreateManagingUnitInput): Promise<ManagingUnit> {
  const { data } = await apiClient.post<ManagingUnit>('/managing-units', input);
  return data;
}

// Sem DELETE físico (regra 1.7 do módulo) — desativa (soft-delete) em vez de excluir de fato.
export async function deactivateManagingUnit(id: string): Promise<ManagingUnit> {
  const { data } = await apiClient.patch<ManagingUnit>(`/managing-units/${id}/deactivate`);
  return data;
}
