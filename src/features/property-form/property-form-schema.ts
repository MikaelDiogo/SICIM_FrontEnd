import { z } from 'zod';
import { MAX_LATITUDE, MAX_LONGITUDE, MIN_LATITUDE, MIN_LONGITUDE } from '@/shared/lib/map-config';
import { PossessionType, UsageCategory } from '@/shared/types/enums';

// Espelha RegisterPropertyDto (backend) campo a campo — qualquer mudança no DTO precisa
// ser refletida aqui para manter os dois lados sincronizados.
const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  zipCode: z.string().optional(),
  reference: z.string().optional(),
});

const possessionContractSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  monthlyValue: z.number().positive().optional(),
  referenceValue: z.number().positive().optional(),
  grantor: z.string().optional(),
  lessor: z.string().optional(),
  administrativeProcessNumber: z.string().optional(),
});

const currentYear = new Date().getFullYear();

export const propertyFormSchema = z.object({
  registrationNumber: z.string().optional(),
  notaryOffice: z.string().optional(),
  notarialDescription: z.string().optional(),
  address: addressSchema,
  totalArea: z.number().positive('Área total deve ser maior que zero').optional(),
  builtArea: z.number().positive('Área construída deve ser maior que zero').optional(),
  latitude: z
    .number()
    .min(MIN_LATITUDE, `Latitude deve estar entre ${MIN_LATITUDE} e ${MAX_LATITUDE} (Crateús/CE)`)
    .max(MAX_LATITUDE, `Latitude deve estar entre ${MIN_LATITUDE} e ${MAX_LATITUDE} (Crateús/CE)`)
    .optional(),
  longitude: z
    .number()
    .min(MIN_LONGITUDE, `Longitude deve estar entre ${MIN_LONGITUDE} e ${MAX_LONGITUDE} (Crateús/CE)`)
    .max(MAX_LONGITUDE, `Longitude deve estar entre ${MIN_LONGITUDE} e ${MAX_LONGITUDE} (Crateús/CE)`)
    .optional(),
  managingUnitId: z.string().optional(),
  budgetUnit: z.string().optional(),
  usageCategory: z.enum(UsageCategory).optional(),
  possessionType: z.enum(PossessionType).optional(),
  possessionContract: possessionContractSchema.optional(),
  acquisitionYear: z
    .number()
    .int()
    .max(currentYear, `Ano de aquisição não pode ser posterior a ${currentYear}`)
    .optional(),
  originalValue: z.number().positive('Valor original deve ser maior que zero').optional(),
  publicPurpose: z.string().optional(),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const emptyPropertyFormValues: PropertyFormValues = {
  registrationNumber: '',
  notaryOffice: '',
  notarialDescription: '',
  address: { street: '', number: '', neighborhood: '', zipCode: '', reference: '' },
  totalArea: 0,
  builtArea: 0,
  latitude: -5.17842,
  longitude: -40.67731,
  managingUnitId: '',
  budgetUnit: '',
  usageCategory: UsageCategory.EDUCATIONAL,
  possessionType: PossessionType.OWNED,
  possessionContract: undefined,
  acquisitionYear: currentYear,
  originalValue: 0,
  publicPurpose: '',
};
