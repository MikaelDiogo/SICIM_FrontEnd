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
      <Table verticalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={30} />
            <Table.Th>Imóvel / Endereço</Table.Th>
            <Table.Th>Matrícula</Table.Th>
            <Table.Th>Unidade Gestora</Table.Th>
            <Table.Th>Posse</Table.Th>
            <Table.Th style={{ whiteSpace: 'nowrap' }}>Área</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Valor Patrimonial</Table.Th>
            <Table.Th>Status</Table.Th>
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
                <Text size="sm" fw={500} c="dark" lineClamp={1}>
                  {property.notarialDescription}
                </Text>
                <Text size="11.5px" c="dimmed" ff="monospace">
                  {property.address.street}, {property.address.number} · {property.address.neighborhood}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="11.5px" c="dimmed" ff="monospace">
                  {property.registrationNumber}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="light" color="brandGreen" radius="xl">
                  {unitNameById.get(property.managingUnitId) ?? '—'}
                </Badge>
              </Table.Td>
              <Table.Td>
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
              <Table.Td style={{ textAlign: 'right' }}>
                <Text size="12.5px" ff="monospace">
                  {formatCurrency(property.netBookValue)}
                </Text>
              </Table.Td>
              <Table.Td>
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
