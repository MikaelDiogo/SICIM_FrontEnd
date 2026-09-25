import type { PagedResult } from '@/entities/property/property.types';

export const PropertyHistoryAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  APPROVE: 'APPROVE',
  DEACTIVATE: 'DEACTIVATE',
  RECALCULATE_DEPRECIATION: 'RECALCULATE_DEPRECIATION',
} as const;
export type PropertyHistoryAction = (typeof PropertyHistoryAction)[keyof typeof PropertyHistoryAction];

export const propertyHistoryActionLabels: Record<PropertyHistoryAction, string> = {
  CREATE: 'Cadastro',
  UPDATE: 'Edição',
  APPROVE: 'Aprovação',
  DEACTIVATE: 'Desativação',
  RECALCULATE_DEPRECIATION: 'Recálculo de Depreciação',
};

// Espelha PropertyHistoryResult (sicim.property_history) — ver API.md.
export interface PropertyHistoryEntry {
  id: string;
  userId: string;
  affectedEntity: string;
  entityId: string;
  action: PropertyHistoryAction;
  dataBefore: Record<string, unknown> | null;
  dataAfter: Record<string, unknown> | null;
  correlationId: string | null;
  timestamp: string;
}

export interface ListPropertyHistoryFilters {
  propertyId?: string;
  userId?: string;
  action?: PropertyHistoryAction;
  page?: number;
  pageSize?: number;
}

export type PropertyHistoryPage = PagedResult<PropertyHistoryEntry>;
