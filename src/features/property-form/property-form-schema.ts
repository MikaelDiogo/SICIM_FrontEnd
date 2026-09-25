import { z } from 'zod';
import { MAX_LATITUDE, MAX_LONGITUDE, MIN_LATITUDE, MIN_LONGITUDE } from '@/shared/lib/map-config';
import { PossessionType, UsageCategory } from '@/shared/types/enums';

const req = (label: string) => z.string().min(1, `${label} é obrigatório`);

// Só o CEP é obrigatório no endereço (ver REGRAS.md RN20) — rua/número/bairro podem ficar em
// branco e ser completados depois.
const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  zipCode: req('CEP'),
  reference: z.string().optional(),
});

const possessionContractSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  monthlyValue: z.number().positive().optional(),
  referenceValue: z.number().positive().optional(),
  grantor: z.string().optional(),
  lessor: z.string().optional(),
  administrativeProcessNumber: req('Número do processo administrativo'),
});

const currentYear = new Date().getFullYear();

// Só notarialDescription, address.zipCode, latitude/longitude e managingUnitId são obrigatórios
// no cadastro (ver REGRAS.md RN20) — o resto pode ficar em branco e ser completado depois,
// inclusive após a aprovação.
export const propertyFormSchema = z.object({
  registrationNumber: z.string().optional(),
  notaryOffice: z.string().optional(),
  notarialDescription: req('Descrição do imóvel'),
  address: addressSchema,
  totalArea: z.number().positive('Área total deve ser maior que zero').optional(),
  builtArea: z.number().positive('Área construída deve ser maior que zero').optional(),
  latitude: z
    .number({ error: 'Latitude é obrigatória' })
    .min(MIN_LATITUDE, `Latitude deve estar entre ${MIN_LATITUDE} e ${MAX_LATITUDE} (Crateús/CE)`)
    .max(MAX_LATITUDE, `Latitude deve estar entre ${MIN_LATITUDE} e ${MAX_LATITUDE} (Crateús/CE)`),
  longitude: z
    .number({ error: 'Longitude é obrigatória' })
    .min(MIN_LONGITUDE, `Longitude deve estar entre ${MIN_LONGITUDE} e ${MAX_LONGITUDE} (Crateús/CE)`)
    .max(MAX_LONGITUDE, `Longitude deve estar entre ${MIN_LONGITUDE} e ${MAX_LONGITUDE} (Crateús/CE)`),
  managingUnitId: z.string().uuid('Selecione uma unidade gestora'),
  budgetUnit: z.string().optional(),
  usageCategory: z.enum(UsageCategory).optional(),
  customCategoryName: z.string().optional(),
  possessionType: z.enum(PossessionType).optional(),
  possessionContract: possessionContractSchema.optional(),
  acquisitionYear: z
    .number()
    .int()
    .min(1800, 'Ano inválido')
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
  totalArea: undefined,
  builtArea: undefined,
  latitude: -5.17842,
  longitude: -40.67731,
  managingUnitId: '',
  budgetUnit: '',
  usageCategory: undefined,
  customCategoryName: '',
  possessionType: PossessionType.OWNED,
  possessionContract: undefined,
  acquisitionYear: undefined,
  originalValue: undefined,
  publicPurpose: '',
};
