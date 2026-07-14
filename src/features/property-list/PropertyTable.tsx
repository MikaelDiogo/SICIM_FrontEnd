import { Badge, Box, Table, Text } from '@mantine/core';
import { useManagingUnits } from '@/entities/managing-unit/managing-unit.hooks';
import type { Property } from '@/entities/property/property.types';
import { formatArea, formatCurrency } from '@/shared/lib/format';
import { pinColorForCategory } from '@/shared/lib/pin-colors';
import { PossessionBadge } from '@/shared/ui/PossessionBadge';
import { StatusBadge } from '@/shared/ui/StatusBadge';

export function PropertyTable({
  properties,
  selectedId,
  onSelect,
}: {
  properties: Property[];
  selectedId?: string;
  onSelect: (property: Property) => void;
}) {
  const { data: managingUnits } = useManagingUnits();
  const unitNameById = new Map(managingUnits?.map((unit) => [unit.id, unit.acronym]));

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table verticalSpacing="md" highlightOnHover style={{ tableLayout: 'fixed', width: '100%', minWidth: 860 }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 26 }} />
            <Table.Th style={{ width: '24%' }}>Imóvel / Endereço</Table.Th>
            <Table.Th style={{ width: '12%' }}>Matrícula</Table.Th>
            <Table.Th style={{ width: '13%' }}>Unidade Gestora</Table.Th>
            <Table.Th style={{ width: '11%' }}>Posse</Table.Th>
            <Table.Th style={{ width: '12%', whiteSpace: 'nowrap' }}>Área</Table.Th>
            <Table.Th style={{ width: '14%', textAlign: 'right' }}>Valor Patrimonial</Table.Th>
            <Table.Th style={{ width: '11%' }}>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {properties.map((property) => (
            <Table.Tr
              key={property.id}
              onClick={() => onSelect(property)}
              style={{
                cursor: 'pointer',
                background: property.id === selectedId ? '#E8F3EB' : undefined,
              }}
            >
              <Table.Td>
                <Box
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: pinColorForCategory(property.usageCategory),
                  }}
                />
              </Table.Td>
              <Table.Td>
                <Text size="xs" fw={500} c="dark" lineClamp={1} title={property.notarialDescription}>
                  {property.notarialDescription}
                </Text>
                <Text size="11px" c="dimmed" ff="monospace" lineClamp={1}>
                  {property.address.street}, {property.address.number} · {property.address.neighborhood}
                </Text>
              </Table.Td>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Text size="11.5px" c="dimmed" ff="monospace">
                  {property.registrationNumber}
                </Text>
              </Table.Td>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Badge variant="light" color="brandGreen" radius="xl" style={{ maxWidth: '100%' }}>
                  {unitNameById.get(property.managingUnitId) ?? '—'}
                </Badge>
              </Table.Td>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <PossessionBadge type={property.possessionType} />
              </Table.Td>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                  {formatArea(property.totalArea)}
                </Text>
                <Text size="11.5px" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  {property.builtArea ? `${formatArea(property.builtArea)} constr.` : '— constr.'}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <Text size="12.5px" ff="monospace">
                  {formatCurrency(property.netBookValue)}
                </Text>
              </Table.Td>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <StatusBadge status={property.status} />
              </Table.Td>
            </Table.Tr>
          ))}
          {properties.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={8}>
                <Text c="dimmed" ta="center" py="lg">
                  Nenhum imóvel encontrado para os filtros selecionados.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
