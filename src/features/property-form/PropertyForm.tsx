import {
  Alert,
  Box,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useManagingUnits } from '@/entities/managing-unit/managing-unit.hooks';
import type { RegisterPropertyInput } from '@/entities/property/property.types';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { estimateNetBookValue } from '@/shared/lib/depreciation-estimate';
import { formatCurrency } from '@/shared/lib/format';
import { CRATEUS_CENTER } from '@/shared/lib/map-config';
import { formatUtmZone, latLngToUtm, utmToLatLng } from '@/shared/lib/utm';
import { usageCategoryLabels, possessionTypeLabels, PossessionType, UsageCategory } from '@/shared/types/enums';
import { RADIUS_MD } from '@/shared/ui/layout-constants';
import { emptyPropertyFormValues, propertyFormSchema, type PropertyFormValues } from './property-form-schema';
import { PropertyMiniMap } from './PropertyMiniMap';
import { PropertyPossessionFields } from './PropertyPossessionFields';

const usageCategoryOptions = (Object.keys(usageCategoryLabels) as UsageCategory[]).map((value) => ({
  value,
  label: usageCategoryLabels[value],
}));

const possessionTypeOptions = (Object.keys(possessionTypeLabels) as PossessionType[]).map((value) => ({
  value,
  label: possessionTypeLabels[value],
}));

function toRegisterInput(values: PropertyFormValues): RegisterPropertyInput {
  return {
    ...values,
    possessionContract:
      values.possessionType === PossessionType.OWNED || !values.possessionContract
        ? undefined
        : {
            ...values.possessionContract,
            startDate: values.possessionContract.startDate?.toISOString(),
            endDate: values.possessionContract.endDate?.toISOString(),
          },
  } as unknown as RegisterPropertyInput;
}

export function PropertyForm({
  initialValues = emptyPropertyFormValues,
  submitLabel = 'Cadastrar Imóvel',
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialValues?: PropertyFormValues;
  submitLabel?: string;
  onSubmit: (input: RegisterPropertyInput) => Promise<unknown>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const { data: managingUnits } = useManagingUnits();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<PropertyFormValues>({
    initialValues,
    validate: schemaResolver(propertyFormSchema),
  });

  const managingUnitOptions = useMemo(
    () => (managingUnits ?? []).map((unit) => ({ value: unit.id, label: `${unit.acronym} — ${unit.name}` })),
    [managingUnits],
  );

  const estimate = useMemo(
    () =>
      estimateNetBookValue(
        form.values.originalValue || 0,
        form.values.usageCategory ?? UsageCategory.OTHER,
        form.values.acquisitionYear ?? new Date().getFullYear(),
      ),
    [form.values.originalValue, form.values.usageCategory, form.values.acquisitionYear],
  );

  const latitude = form.values.latitude ?? CRATEUS_CENTER[1];
  const longitude = form.values.longitude ?? CRATEUS_CENTER[0];
  const utm = useMemo(() => latLngToUtm(latitude, longitude), [latitude, longitude]);

  const handleUtmChange = (field: 'easting' | 'northing', value: number) => {
    const { lat, lng } = utmToLatLng({ ...utm, [field]: value });
    form.setFieldValue('latitude', Number(lat.toFixed(6)));
    form.setFieldValue('longitude', Number(lng.toFixed(6)));
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await onSubmit(toRegisterInput(values));
      setSuccessMessage('Imóvel salvo com sucesso.');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Não foi possível salvar o imóvel.'));
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert color="green" icon={<IconCheck size={16} />} mb="md">
          {successMessage}
        </Alert>
      )}

      <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* COLUNA ESQUERDA */}
        <Paper style={{ overflow: 'hidden' }}>
          <Box p="16px 20px" style={{ borderBottom: '1px solid #ededed' }}>
            <Text fw={700} mb={4} style={{ fontSize: 15 }}>
              Identificação do Imóvel
            </Text>
            <Text size="11.5px" c="dimmed" tt="uppercase" mb={14} style={{ letterSpacing: 1.2 }}>
              Dados de registro cartorial
            </Text>

            <SimpleGrid cols={2} mb={14}>
              <TextInput label="Matrícula" placeholder="MAT-2026-00148" {...form.getInputProps('registrationNumber')} />
              <TextInput label="Cartório" placeholder="1º Ofício de Crateús" {...form.getInputProps('notaryOffice')} />
            </SimpleGrid>
            <Textarea
              label="Descrição do Imóvel"
              minRows={3}
              placeholder="Descreva o imóvel — tipo de edificação, finalidade, características construtivas..."
              {...form.getInputProps('notarialDescription')}
            />
          </Box>

          <Box p="16px 20px" style={{ borderBottom: '1px solid #ededed' }}>
            <Text fw={700} mb={4} style={{ fontSize: 15 }}>
              Situação Jurídica e Destinação
            </Text>
            <Text size="11.5px" c="dimmed" tt="uppercase" mb={14} style={{ letterSpacing: 1.2 }}>
              Tipo de posse e finalidade de uso
            </Text>

            <SimpleGrid cols={2} mb={14}>
              <Select
                label="Tipo de Posse"
                data={possessionTypeOptions}
                description="Define a natureza jurídica da posse municipal"
                {...form.getInputProps('possessionType')}
              />
              <Select label="Categoria de Uso" data={usageCategoryOptions} {...form.getInputProps('usageCategory')} />
            </SimpleGrid>

            <Textarea
              label="Destinação / Finalidade do Imóvel"
              rows={3}
              description="Especifique o uso atual e finalidade pública atendida pelo imóvel"
              placeholder="Ex: Funcionamento da Escola Municipal de Ensino Fundamental..."
              {...form.getInputProps('publicPurpose')}
            />

            <PropertyPossessionFields form={form} />
          </Box>

          <Box p="16px 20px" style={{ borderBottom: '1px solid #ededed' }}>
            <Text fw={700} mb={4} style={{ fontSize: 15 }}>
              Endereço
            </Text>
            <Text size="11.5px" c="dimmed" tt="uppercase" mb={14} style={{ letterSpacing: 1.2 }}>
              Localização física do imóvel
            </Text>

            <SimpleGrid cols={2} mb={14}>
              <TextInput label="CEP" placeholder="63700-000" {...form.getInputProps('address.zipCode')} />
              <TextInput label="Bairro" placeholder="Centro" {...form.getInputProps('address.neighborhood')} />
            </SimpleGrid>
            <TextInput
              label="Logradouro"
              mb={14}
              placeholder="Ex: Rua das Flores"
              {...form.getInputProps('address.street')}
            />
            <SimpleGrid cols={2}>
              <TextInput label="Número" placeholder="124 ou s/n" {...form.getInputProps('address.number')} />
              <TextInput label="Complemento" placeholder="Bloco, andar, etc." {...form.getInputProps('address.reference')} />
            </SimpleGrid>
          </Box>

          <Box p="16px 20px">
            <Text fw={700} mb={4} style={{ fontSize: 15 }}>
              Dimensões
            </Text>
            <Text size="11.5px" c="dimmed" tt="uppercase" mb={14} style={{ letterSpacing: 1.2 }}>
              Medidas físicas do bem
            </Text>
            <SimpleGrid cols={2}>
              <NumberInput label="Área Total" suffix=" m²" decimalScale={2} {...form.getInputProps('totalArea')} />
              <NumberInput
                label="Área Construída"
                suffix=" m²"
                decimalScale={2}
                {...form.getInputProps('builtArea')}
              />
            </SimpleGrid>
          </Box>
        </Paper>

        {/* COLUNA DIREITA */}
        <Paper style={{ overflow: 'hidden' }}>
          <Box p="16px 20px 0">
            <Text fw={700} mb={4} style={{ fontSize: 15 }}>
              Geolocalização (UTM)
            </Text>
            <Text size="11.5px" c="dimmed" tt="uppercase" mb={14} style={{ letterSpacing: 1.2 }}>
              Fuso {formatUtmZone(utm)} · SIRGAS 2000 · clique no mapa para capturar
            </Text>
            <SimpleGrid cols={2} mb={14}>
              <NumberInput
                label="Coordenada E (Este)"
                suffix=" m"
                decimalScale={2}
                value={utm.easting}
                onChange={(value) => handleUtmChange('easting', Number(value) || 0)}
              />
              <NumberInput
                label="Coordenada N (Norte)"
                suffix=" m"
                decimalScale={2}
                value={utm.northing}
                onChange={(value) => handleUtmChange('northing', Number(value) || 0)}
              />
            </SimpleGrid>
          </Box>

          <PropertyMiniMap
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              form.setFieldValue('latitude', Number(lat.toFixed(6)));
              form.setFieldValue('longitude', Number(lng.toFixed(6)));
            }}
          />

          <Box p="16px 20px" style={{ borderTop: '1px solid #ededed', borderBottom: '1px solid #ededed' }}>
            <Text fw={700} mb={4} style={{ fontSize: 15 }}>
              Vinculação Administrativa
            </Text>
            <Text size="11.5px" c="dimmed" tt="uppercase" mb={14} style={{ letterSpacing: 1.2 }}>
              Unidade responsável e dados orçamentários
            </Text>
            <SimpleGrid cols={2}>
              <Select label="Unidade Gestora" data={managingUnitOptions} searchable {...form.getInputProps('managingUnitId')} />
              <TextInput label="Unidade Orçamentária" placeholder="02.04.001" {...form.getInputProps('budgetUnit')} />
            </SimpleGrid>
          </Box>

          <Box p="16px 20px">
            <Text fw={700} mb={4} style={{ fontSize: 15 }}>
              Informações Contábeis
            </Text>
            <Text size="11.5px" c="dimmed" tt="uppercase" mb={14} style={{ letterSpacing: 1.2 }}>
              Aquisição e valor patrimonial
            </Text>
            <SimpleGrid cols={2} mb={14}>
              <NumberInput label="Ano Aquisição" {...form.getInputProps('acquisitionYear')} />
              <NumberInput
                label="Valor Original"
                prefix="R$ "
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                {...form.getInputProps('originalValue')}
              />
            </SimpleGrid>

            <Box
              p="14px 16px"
              style={{ background: 'linear-gradient(135deg, #FBF6DC 0%, #f9f0d4 100%)', border: '1px solid #e6d99c', borderRadius: RADIUS_MD }}
            >
              <Text size="10.5px" tt="uppercase" fw={700} c="#7a6418" mb={6} style={{ letterSpacing: 1.5 }}>
                ⛁ Valor Patrimonial Líquido (estimativa)
              </Text>
              <Text fw={700} style={{ fontSize: 20 }}>
                {formatCurrency(estimate.netBookValue)}
              </Text>
              <Text size="11px" c="dimmed" mt={6}>
                Estimativa local — o valor oficial é calculado e persistido pelo backend após o cadastro.
              </Text>
            </Box>
          </Box>
        </Paper>

        <Box style={{ gridColumn: '1 / -1', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Text size="xs" c="dimmed">
            ⓘ As informações serão registradas no sistema com data e hora. Você poderá editá-las posteriormente.
          </Text>
          <Group gap={10}>
            <Button variant="default" onClick={onCancel} type="button">
              Cancelar
            </Button>
            <Button type="submit" color="brandGreen" loading={isSubmitting} leftSection={<IconCheck size={13} />}>
              {submitLabel}
            </Button>
          </Group>
        </Box>
      </Box>
    </form>
  );
}
