import type { PossessionType, PropertyStatus, UsageCategory } from '@/shared/types/enums';

export interface Address {
  // Só o CEP é obrigatório — o resto pode ser completado depois (ver REGRAS.md RN20).
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  // Bairro da plataforma (geography), opcional — ver API.md.
  neighborhoodId?: string | null;
  zipCode: string;
  reference?: string;
}

export type PropertyLifecycleStatus = 'ACTIVE' | 'INACTIVE';

export interface PossessionContract {
  startDate: string;
  endDate?: string;
  monthlyValue?: number;
  referenceValue?: number;
  grantor?: string;
  lessor?: string;
  administrativeProcessNumber: string;
}

// Espelha PropertyPresenter.toHttp no backend (property.presenter.ts).
// Só notarialDescription, address.zipCode, latitude/longitude e managingUnitId são garantidos —
// o resto pode estar ausente até ser completado (ver REGRAS.md RN20).
export interface Property {
  id: string;
  registrationNumber: string | null;
  notaryOffice: string | null;
  notarialDescription: string;
  address: Address;
  totalArea: number | null;
  builtArea: number | null;
  latitude: number;
  longitude: number;
  managingUnitId: string;
  budgetUnit?: string;
  usageCategory: UsageCategory | null;
  customCategoryName: string | null;
  possessionType: PossessionType | null;
  possessionContract: PossessionContract | null;
  acquisitionYear: number | null;
  originalValue: number | null;
  accumulatedDepreciation: number | null;
  netBookValue: number | null;
  publicPurpose: string | null;
  status: PropertyStatus;
  createdById: string;
  approvedById: string | null;
  approvedAt: string | null;
  lifecycleStatus: PropertyLifecycleStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Espelha RegisterPropertyRequest do backend. Só notarialDescription, address.zipCode,
// latitude/longitude e managingUnitId são obrigatórios (ver REGRAS.md RN20) — o resto pode
// ficar em branco e ser completado depois, inclusive após a aprovação.
export interface RegisterPropertyInput {
  registrationNumber?: string;
  notaryOffice?: string;
  notarialDescription: string;
  address: Address;
  totalArea?: number;
  builtArea?: number;
  latitude: number;
  longitude: number;
  managingUnitId: string;
  budgetUnit?: string;
  usageCategory?: UsageCategory;
  customCategoryName?: string;
  possessionType?: PossessionType;
  possessionContract?: {
    startDate: string;
    endDate?: string;
    monthlyValue?: number;
    referenceValue?: number;
    grantor?: string;
    lessor?: string;
    administrativeProcessNumber: string;
  };
  acquisitionYear?: number;
  originalValue?: number;
  publicPurpose?: string;
}

export type UpdatePropertyInput = Partial<RegisterPropertyInput>;

// Espelha ListPropertiesDto.
export interface ListPropertiesFilters {
  status?: PropertyStatus;
  usageCategory?: UsageCategory;
  managingUnitId?: string;
  acquisitionYearFrom?: number;
  acquisitionYearTo?: number;
  page?: number;
  pageSize?: number;
}
