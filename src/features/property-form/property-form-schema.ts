import { z } from 'zod';
import { MAX_LATITUDE, MAX_LONGITUDE, MIN_LATITUDE, MIN_LONGITUDE } from '@/shared/lib/map-config';
import { PossessionType, UsageCategory } from '@/shared/types/enums';

const req = (label: string) => z.string().min(1, `${label} é obrigatório`);

const addressSchema = z.object({
  street: req('Logradouro'),
  number: req('Número'),
  neighborhood: req('Bairro'),
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

export const propertyFormSchema = z.object({
  registrationNumber: req('Matrícula'),
  notaryOffice: req('Cartório'),
  notarialDescription: req('Descrição do imóvel'),
  address: addressSchema,
  totalArea: z.number({ required_error: 'Área total é obrigatória' }).positive('Área total deve ser maior que zero'),
  builtArea: z.number({ required_error: 'Área construída é obrigatória' }).positive('Área construída deve ser maior que zero'),
  latitude: z
    .number({ required_error: 'Latitude é obrigatória' })
    .min(MIN_LATITUDE, `Latitude deve estar entre ${MIN_LATITUDE} e ${MAX_LATITUDE} (Crateús/CE)`)
    .max(MAX_LATITUDE, `Latitude deve estar entre ${MIN_LATITUDE} e ${MAX_LATITUDE} (Crateús/CE)`),
  longitude: z
    .number({ required_error: 'Longitude é obrigatória' })
    .min(MIN_LONGITUDE, `Longitude deve estar entre ${MIN_LONGITUDE} e ${MAX_LONGITUDE} (Crateús/CE)`)
    .max(MAX_LONGITUDE, `Longitude deve estar entre ${MIN_LONGITUDE} e ${MAX_LONGITUDE} (Crateús/CE)`),
  managingUnitId: z.string().uuid('Selecione uma unidade gestora'),
  budgetUnit: z.string().optional(),
  usageCategory: z.enum(UsageCategory),
  customCategoryName: z.string().optional(),
  possessionType: z.enum(PossessionType),
  possessionContract: possessionContractSchema.optional(),
  acquisitionYear: z
    .number({ required_error: 'Ano de aquisição é obrigatório' })
    .int()
    .min(1800, 'Ano inválido')
    .max(currentYear, `Ano de aquisição não pode ser posterior a ${currentYear}`),
  originalValue: z.number({ required_error: 'Valor original é obrigatório' }).positive('Valor original deve ser maior que zero'),
  publicPurpose: req('Destinação / Finalidade'),
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
  customCategoryName: '',
  possessionType: PossessionType.OWNED,
  possessionContract: undefined,
  acquisitionYear: currentYear,
  originalValue: 0,
  publicPurpose: '',
};
