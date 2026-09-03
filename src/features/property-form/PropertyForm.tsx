import {
  Alert,
  Box,
  Button,
  Combobox,
  Group,
  InputBase,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useManagingUnits } from '@/entities/managing-unit/managing-unit.hooks';
import { useCustomCategories } from '@/entities/property/property.hooks';
import type { RegisterPropertyInput } from '@/entities/property/property.types';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { estimateNetBookValue } from '@/shared/lib/depreciation-estimate';
import { formatCurrency } from '@/shared/lib/format';
import { CRATEUS_CENTER } from '@/shared/lib/map-config';
import { latLngToUtm, utmToLatLng } from '@/shared/lib/utm';
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
    customCategoryName: values.usageCategory === UsageCategory.OTHER && values.customCategoryName
      ? values.customCategoryName
      : undefined,
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
  const { data: existingCustomCategories = [] } = useCustomCategories();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customCategorySearch, setCustomCategorySearch] = useState('');
  const customCategoryCombobox = useCombobox({ onDropdownClose: () => customCategoryCombobox.resetSelectedOption() });

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

  const derivedUtm = useMemo(() => latLngToUtm(latitude, longitude), [latitude, longitude]);

  const formatUtm = (v: number) => Math.round(v).toLocaleString('pt-BR');

  const [utmEastingText, setUtmEastingText] = useState(() => formatUtm(derivedUtm.easting));
  const [utmNorthingText, setUtmNorthingText] = useState(() => formatUtm(derivedUtm.northing));

  // Ref que indica se a última mudança de lat/lng veio dos próprios campos UTM.
  // Se veio daqui, o useEffect não sobrescreve o texto que o usuário está digitando.
  const utmOrigin = useRef(false);

  useEffect(() => {
    if (utmOrigin.current) {
      utmOrigin.current = false;
      return;
    }
    // Mudança veio do mapa → atualiza os campos de texto UTM
    setUtmEastingText(formatUtm(derivedUtm.easting));
    setUtmNorthingText(formatUtm(derivedUtm.northing));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  // Remove prefixos "E:", "N:", espaços, sufixos, e interpreta separadores pt-BR
  const parseUtmText = (text: string): number | null => {
    const cleaned = text.replace(/[ENen:\s°mM]/g, '');
    let normalized = cleaned;
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (lastDot !== -1 && cleaned.slice(lastDot + 1).length === 3 && !cleaned.includes(',')) {
      normalized = cleaned.replace(/\./g, '');
    }
    const n = parseFloat(normalized);
    return isFinite(n) && n > 0 ? n : null;
  };

  const applyUtmTexts = (eastingText: string, northingText: string) => {
    const e = parseUtmText(eastingText);
    const n = parseUtmText(northingText);
    // Só converte quando ambos têm magnitude razoável para UTM 24S
    if (e === null || n === null || e < 100_000 || n < 1_000_000) return;
    utmOrigin.current = true;
    const { lat, lng } = utmToLatLng({ easting: e, northing: n, zone: 24, hemisphere: 'S' });
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
            <Text fw={700} mb={14} style={{ fontSize: 15 }}>
              Identificação do Imóvel
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
            <Text fw={700} mb={14} style={{ fontSize: 15 }}>
              Situação Jurídica e Destinação
            </Text>

            <SimpleGrid cols={2} mb={form.values.usageCategory === UsageCategory.OTHER ? 10 : 14}>
              <Select
                label="Tipo de Posse"
                data={possessionTypeOptions}
                {...form.getInputProps('possessionType')}
              />
              <Select
                label="Categoria de Uso"
                data={usageCategoryOptions}
                {...form.getInputProps('usageCategory')}
                onChange={(value) => {
                  form.setFieldValue('usageCategory', value as UsageCategory);
                  if (value !== UsageCategory.OTHER) form.setFieldValue('customCategoryName', '');
                }}
              />
            </SimpleGrid>

            {form.values.usageCategory === UsageCategory.OTHER && (
              <Combobox
                store={customCategoryCombobox}
                onOptionSubmit={(val) => {
                  form.setFieldValue('customCategoryName', val);
                  setCustomCategorySearch(val);
                  customCategoryCombobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <InputBase
                    label="Nome da categoria personalizada"
                    placeholder="Ex: Obras, Esporte, Infraestrutura..."
                    mb={14}
                    value={customCategorySearch || form.values.customCategoryName || ''}
                    onChange={(e) => {
                      const v = e.currentTarget.value;
                      setCustomCategorySearch(v);
                      form.setFieldValue('customCategoryName', v);
                      customCategoryCombobox.openDropdown();
                    }}
                    onClick={() => customCategoryCombobox.openDropdown()}
                    onFocus={() => customCategoryCombobox.openDropdown()}
                    onBlur={() => customCategoryCombobox.closeDropdown()}
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                  />
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Options>
                    {existingCustomCategories
                      .filter((c) => c.toLowerCase().includes((customCategorySearch || '').toLowerCase()))
                      .map((c) => (
                        <Combobox.Option key={c} value={c}>{c}</Combobox.Option>
                      ))}
                    {customCategorySearch && !existingCustomCategories.includes(customCategorySearch) && (
                      <Combobox.Option value={customCategorySearch}>
                        + Criar &quot;{customCategorySearch}&quot;
                      </Combobox.Option>
                    )}
                    {existingCustomCategories.length === 0 && !customCategorySearch && (
                      <Combobox.Empty>Nenhuma categoria anterior</Combobox.Empty>
                    )}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            )}

            <Textarea
              label="Destinação / Finalidade do Imóvel"
              rows={3}
              placeholder="Ex: Funcionamento da Escola Municipal de Ensino Fundamental..."
              {...form.getInputProps('publicPurpose')}
            />

            <PropertyPossessionFields form={form} />
          </Box>

          <Box p="16px 20px" style={{ borderBottom: '1px solid #ededed' }}>
            <Text fw={700} mb={14} style={{ fontSize: 15 }}>
              Endereço
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
            <Text fw={700} mb={14} style={{ fontSize: 15 }}>
              Dimensões
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
            <Text fw={700} mb={14} style={{ fontSize: 15 }}>
              Geolocalização (UTM)
            </Text>
            <SimpleGrid cols={2} mb={14}>
              <TextInput
                label="Coordenada E (Este)"
                placeholder="Ex: 427.600"
                rightSection={<Text size="xs" c="dimmed">m</Text>}
                value={utmEastingText}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setUtmEastingText(v);
                  applyUtmTexts(v, utmNorthingText);
                }}
                onBlur={() => {
                  applyUtmTexts(utmEastingText, utmNorthingText);
                  const parsed = parseUtmText(utmEastingText);
                  if (parsed) setUtmEastingText(formatUtm(parsed));
                }}
              />
              <TextInput
                label="Coordenada N (Norte)"
                placeholder="Ex: 9.427.700"
                rightSection={<Text size="xs" c="dimmed">m</Text>}
                value={utmNorthingText}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setUtmNorthingText(v);
                  applyUtmTexts(utmEastingText, v);
                }}
                onBlur={() => {
                  applyUtmTexts(utmEastingText, utmNorthingText);
                  const parsed = parseUtmText(utmNorthingText);
                  if (parsed) setUtmNorthingText(formatUtm(parsed));
                }}
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
            <Text fw={700} mb={14} style={{ fontSize: 15 }}>
              Vinculação Administrativa
            </Text>
            <SimpleGrid cols={2}>
              <Select label="Unidade Gestora" data={managingUnitOptions} searchable {...form.getInputProps('managingUnitId')} />
              <TextInput label="Unidade Orçamentária" placeholder="02.04.001" {...form.getInputProps('budgetUnit')} />
            </SimpleGrid>
          </Box>

          <Box p="16px 20px">
            <Text fw={700} mb={14} style={{ fontSize: 15 }}>
              Informações Contábeis
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
