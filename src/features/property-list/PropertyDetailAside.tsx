import { Box, Button, Group, Paper, Text } from '@mantine/core';
import { IconEdit, IconMapPin } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useManagingUnit } from '@/entities/managing-unit/managing-unit.hooks';
import type { Property } from '@/entities/property/property.types';
import { formatCoordinate, formatCurrency } from '@/shared/lib/format';
import { usageCategoryLabels } from '@/shared/types/enums';
import { PossessionBadge } from '@/shared/ui/PossessionBadge';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Group justify="space-between" py={6} align="baseline">
      <Text size="12.5px" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} ta="right">
        {value}
      </Text>
    </Group>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box p="14px 18px" style={{ borderBottom: '1px solid #ededed' }}>
      <Text size="10px" tt="uppercase" fw={600} c="dimmed" mb={10} style={{ letterSpacing: 1.8 }}>
        {label}
      </Text>
      {children}
    </Box>
  );
}

export function PropertyDetailAside({ property }: { property: Property | null }) {
  const navigate = useNavigate();
  const { data: managingUnit } = useManagingUnit(property?.managingUnitId);

  if (!property) {
    return (
      <Paper p="xl">
        <Text c="dimmed" size="sm" ta="center">
          Selecione um imóvel na tabela para ver os detalhes.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper style={{ overflow: 'hidden' }}>
      <Box p="16px 18px" style={{ background: '#1A5C2A', color: '#fff', position: 'relative' }}>
        <Text size="11px" c="rgba(255,255,255,0.5)" tt="uppercase" ff="monospace" mb={6} style={{ letterSpacing: 1.5 }}>
          ⌗ {property.registrationNumber} · {property.notaryOffice}
        </Text>
        <Text
          fw={700}
          mb={6}
          style={{ fontSize: 17, lineHeight: 1.25 }}
        >
          {property.notarialDescription.slice(0, 80)}
        </Text>
        <Text size="12.5px" c="rgba(255,255,255,0.7)">
          {property.address.street}, {property.address.number} — {property.address.neighborhood}
          <br />
          Crateús/CE · CEP {property.address.zipCode}
        </Text>
      </Box>

      <Section label="⌖ Geolocalização">
        <DetailRow label="Latitude" value={formatCoordinate(property.latitude)} />
        <DetailRow label="Longitude" value={formatCoordinate(property.longitude)} />
      </Section>

      <Section label="Situação Jurídica e Destinação">
        <DetailRow label="Tipo de Posse" value={<PossessionBadge type={property.possessionType} />} />
        <DetailRow label="Categoria de Uso" value={usageCategoryLabels[property.usageCategory]} />
        <Box mt={10} pt={12} style={{ borderTop: '1px dashed #ededed' }}>
          <Text size="12.5px" c="dimmed" mb={6}>
            Finalidade
          </Text>
          <Text size="12.5px" c="#4a4a4a" style={{ lineHeight: 1.55 }}>
            {property.publicPurpose}
          </Text>
        </Box>
      </Section>

      <Section label="Características Físicas">
        <DetailRow label="Área Total" value={`${property.totalArea} m²`} />
        <DetailRow label="Área Construída" value={`${property.builtArea} m²`} />
        <DetailRow label="Cartório" value={property.notaryOffice} />
      </Section>

      <Section label="Vinculação Administrativa">
        <DetailRow label="Unidade Gestora" value={managingUnit?.name ?? '—'} />
        <DetailRow label="Unidade Orçamentária" value={property.budgetUnit ?? '—'} />
        <DetailRow label="Ano de Aquisição" value={property.acquisitionYear} />
      </Section>

      <Box p="14px 18px" style={{ background: 'linear-gradient(135deg, #FBF6DC 0%, #f9f0d4 100%)', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
        <Text size="11px" tt="uppercase" fw={700} c="#7a6418" mb={6} style={{ letterSpacing: 1.5 }}>
          Valor Patrimonial Líquido
        </Text>
        <Text fw={700} style={{ fontSize: 22 }}>
          {formatCurrency(property.netBookValue)}
        </Text>
        <Group gap={14} mt={10}>
          <Text size="11.5px" c="#4a4a4a">
            Original: <Text component="span" fw={600} ff="monospace" c="dark">{formatCurrency(property.originalValue)}</Text>
          </Text>
          <Text size="11.5px" c="#4a4a4a">
            Deprec.: <Text component="span" fw={600} ff="monospace" c="#9c3838">−{formatCurrency(property.accumulatedDepreciation)}</Text>
          </Text>
        </Group>
      </Box>

      <Section label="Descrição do Imóvel">
        <Text size="12.5px" c="#4a4a4a" style={{ lineHeight: 1.6 }}>
          {property.notarialDescription}
        </Text>
      </Section>

      <Group p="14px 18px" gap={8}>
        <Button
          variant="default"
          flex={1}
          leftSection={<IconEdit size={13} />}
          onClick={() => navigate(`/imoveis/${property.id}/editar`)}
        >
          Editar
        </Button>
        <Button flex={1} color="brandGreen" leftSection={<IconMapPin size={13} />} onClick={() => navigate('/mapa')}>
          Abrir no Mapa
        </Button>
      </Group>
    </Paper>
  );
}
