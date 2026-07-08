import type { ManagingUnitType } from '@/shared/types/enums';

export interface ManagingUnit {
  id: string;
  name: string;
  acronym: string;
  type: ManagingUnitType;
  createdAt: string;
}

export interface RegisterManagingUnitInput {
  name: string;
  acronym: string;
  type: ManagingUnitType;
}
