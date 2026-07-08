import type { PossessionType, PropertyStatus, UsageCategory } from '@/shared/types/enums';

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  zipCode: string;
  reference?: string;
}

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
export interface Property {
  id: string;
  registrationNumber: string;
  notaryOffice: string;
  notarialDescription: string;
  address: Address;
  totalArea: number;
  builtArea: number;
  latitude: number;
  longitude: number;
  managingUnitId: string;
  budgetUnit?: string;
  usageCategory: UsageCategory;
  possessionType: PossessionType;
  possessionContract: PossessionContract | null;
  acquisitionYear: number;
  originalValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  publicPurpose: string;
  status: PropertyStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Espelha RegisterPropertyDto.
export interface RegisterPropertyInput {
  registrationNumber: string;
  notaryOffice: string;
  notarialDescription: string;
  address: Address;
  totalArea: number;
  builtArea: number;
  latitude: number;
  longitude: number;
  managingUnitId: string;
  budgetUnit?: string;
  usageCategory: UsageCategory;
  possessionType: PossessionType;
  possessionContract?: {
    startDate: string;
    endDate?: string;
    monthlyValue?: number;
    referenceValue?: number;
    grantor?: string;
    lessor?: string;
    administrativeProcessNumber: string;
  };
  acquisitionYear: number;
  originalValue: number;
  publicPurpose: string;
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
