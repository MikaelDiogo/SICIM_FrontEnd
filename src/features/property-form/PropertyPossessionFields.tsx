import { Box, Group, NumberInput, SimpleGrid, Text, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import { PossessionType } from '@/shared/types/enums';
import { RADIUS_MD } from '@/shared/ui/layout-constants';
import type { PropertyFormValues } from './property-form-schema';

const valueFieldLabel: Record<Exclude<PossessionType, 'OWNED'>, string> = {
  RENTED: 'Valor Mensal do Contrato',
  GRANTED: 'Valor de Referência',
  LOAN: 'Valor de Referência',
  USUFRUCT: 'Valor de Referência',
  USE_PERMIT: 'Valor de Referência',
};

export function PropertyPossessionFields({ form }: { form: UseFormReturnType<PropertyFormValues> }) {
  const possessionType = form.values.possessionType;
  if (!possessionType || possessionType === PossessionType.OWNED) return null;

  const isMonthly = possessionType === PossessionType.RENTED;

  return (
    <Box mt={14} p={16} style={{ background: '#E8F3EB', border: '1px solid #c5dccc', borderRadius: RADIUS_MD }}>
      <Text size="11px" tt="uppercase" fw={700} c="#1A5C2A" mb={12} style={{ letterSpacing: 1.3 }}>
        ⓘ Informações adicionais da posse
      </Text>

      <SimpleGrid cols={2} mb={14}>
        <TextInput
          label="Proprietário / Cedente"
          placeholder="Nome do proprietário ou órgão cedente"
          {...form.getInputProps('possessionContract.grantor')}
        />
        <NumberInput
          label={valueFieldLabel[possessionType]}
          placeholder="0,00"
          prefix="R$ "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          {...form.getInputProps(isMonthly ? 'possessionContract.monthlyValue' : 'possessionContract.referenceValue')}
        />
      </SimpleGrid>

      <SimpleGrid cols={2} mb={14}>
        <DateInput
          label="Início da Vigência"
          placeholder="DD/MM/AAAA"
          valueFormat="DD/MM/YYYY"
          {...form.getInputProps('possessionContract.startDate')}
        />
        <DateInput
          label="Término da Vigência"
          placeholder="DD/MM/AAAA"
          valueFormat="DD/MM/YYYY"
          {...form.getInputProps('possessionContract.endDate')}
        />
      </SimpleGrid>

      <Group grow>
        <TextInput
          label="Nº do Contrato / Instrumento"
          placeholder="Ex: CT-2024-0042 ou Termo de Cessão nº..."
          {...form.getInputProps('possessionContract.administrativeProcessNumber')}
        />
      </Group>
    </Box>
  );
}
