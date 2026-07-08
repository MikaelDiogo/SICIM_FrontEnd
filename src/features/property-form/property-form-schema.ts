import { z } from 'zod';
import { MAX_LATITUDE, MAX_LONGITUDE, MIN_LATITUDE, MIN_LONGITUDE } from '@/shared/lib/map-config';
import { PossessionType, UsageCategory } from '@/shared/types/enums';

// Espelha RegisterPropertyDto (backend) campo a campo — qualquer mudança no DTO precisa
// ser refletida aqui para manter os dois lados sincronizados.
const addressSchema = z.object({
  street: z.string().min(1, 'Informe o logradouro'),
  number: z.string().min(1, 'Informe o número'),
  neighborhood: z.string().min(1, 'Informe o bairro'),
  zipCode: z.string().min(1, 'Informe o CEP'),
  reference: z.string().optional(),
});

const possessionContractSchema = z.object({
  startDate: z.date({ message: 'Informe a data de início' }),
  endDate: z.date().optional(),
  monthlyValue: z.number().positive().optional(),
  referenceValue: z.number().positive().optional(),
  grantor: z.string().optional(),
  lessor: z.string().optional(),
  administrativeProcessNumber: z.string().min(1, 'Informe o número do processo/contrato'),
});

const currentYear = new Date().getFullYear();

export const propertyFormSchema = z
  .object({
    registrationNumber: z.string().min(1, 'Informe a matrícula'),
    notaryOffice: z.string().min(1, 'Informe o cartório'),
    notarialDescription: z.string().min(1, 'Descreva o imóvel'),
    address: addressSchema,
    totalArea: z.number().positive('Área total deve ser maior que zero'),
    builtArea: z.number().positive('Área construída deve ser maior que zero'),
    latitude: z
      .number()
      .min(MIN_LATITUDE, `Latitude deve estar entre ${MIN_LATITUDE} e ${MAX_LATITUDE} (Crateús/CE)`)
      .max(MAX_LATITUDE, `Latitude deve estar entre ${MIN_LATITUDE} e ${MAX_LATITUDE} (Crateús/CE)`),
    longitude: z
      .number()
      .min(MIN_LONGITUDE, `Longitude deve estar entre ${MIN_LONGITUDE} e ${MAX_LONGITUDE} (Crateús/CE)`)
      .max(MAX_LONGITUDE, `Longitude deve estar entre ${MIN_LONGITUDE} e ${MAX_LONGITUDE} (Crateús/CE)`),
    managingUnitId: z.string().uuid('Selecione a unidade gestora'),
    budgetUnit: z.string().optional(),
    usageCategory: z.enum(UsageCategory),
    possessionType: z.enum(PossessionType),
    possessionContract: possessionContractSchema.optional(),
    acquisitionYear: z
      .number()
      .int()
      .min(1800)
      .max(currentYear, `Ano de aquisição não pode ser posterior a ${currentYear}`),
    originalValue: z.number().positive('Valor original deve ser maior que zero'),
    publicPurpose: z.string().min(1, 'Descreva a finalidade pública'),
  })
  .refine(
    (data) => data.possessionType === PossessionType.OWNED || data.possessionContract !== undefined,
    {
      message: 'Informe os dados do contrato de posse para imóveis não próprios',
      path: ['possessionContract', 'administrativeProcessNumber'],
    },
  );

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
