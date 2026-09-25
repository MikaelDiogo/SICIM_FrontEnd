import { Badge, Box, Drawer, Group, Loader, Pagination, Paper, Select, Table, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePropertyHistory } from '@/entities/property-history/property-history.hooks';
import {
  propertyHistoryActionLabels,
  PropertyHistoryAction,
  type PropertyHistoryEntry,
} from '@/entities/property-history/property-history.types';
import { useAllProperties } from '@/entities/property/property.hooks';
import { diffHistoryEntry, formatDiffValue } from '@/shared/lib/history-diff';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { formatDateTime } from '@/shared/lib/format';
import { PAGE_GUTTER_X } from '@/shared/ui/layout-constants';
import { PageHeader } from '@/shared/ui/PageHeader';

const PAGE_SIZE = 20;

const actionColor: Record<PropertyHistoryAction, string> = {
  CREATE: 'brandGreen',
  UPDATE: 'blue',
  APPROVE: 'teal',
  DEACTIVATE: 'red',
  RECALCULATE_DEPRECIATION: 'brandGold',
};

const actionOptions = (Object.keys(propertyHistoryActionLabels) as PropertyHistoryAction[]).map((value) => ({
  value,
  label: propertyHistoryActionLabels[value],
}));

export function PropertyHistoryPage() {
  const [searchParams] = useSearchParams();
  const [propertyId, setPropertyId] = useState<string | null>(searchParams.get('propertyId'));
  const [action, setAction] = useState<PropertyHistoryAction | null>(null);
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PropertyHistoryEntry | null>(null);

  const { data: properties } = useAllProperties();
  const propertyOptions = useMemo(
    () =>
      (properties ?? []).map((p) => ({
        value: p.id,
        label: `${p.registrationNumber ?? 'sem matrícula'} — ${p.notarialDescription.slice(0, 40)}`,
      })),
    [properties],
  );
  const propertyById = useMemo(() => new Map((properties ?? []).map((p) => [p.id, p])), [properties]);

  const filters = useMemo(
    () => ({
      propertyId: propertyId ?? undefined,
      action: action ?? undefined,
      userId: userId.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [propertyId, action, userId, page],
  );

  const { data, isLoading, isError, error } = usePropertyHistory(filters);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const resetPage = () => setPage(1);
  const diff = selected ? diffHistoryEntry(selected.dataBefore, selected.dataAfter) : [];

  return (
    <>
      <PageHeader
        eyebrow="Auditoria"
        title="Histórico de Alterações"
        subtitle="Toda escrita nos imóveis fica registrada aqui — quem fez, quando e o que mudou."
      />
      <Box p={`24px ${PAGE_GUTTER_X}px 60px`}>
        <Paper p="14px 18px" mb={16}>
          <Group gap={12} wrap="wrap">
            <Select
              placeholder="Filtrar por imóvel"
              data={propertyOptions}
              value={propertyId}
              onChange={(v) => {
                setPropertyId(v);
                resetPage();
              }}
              searchable
              clearable
              w={320}
              size="xs"
            />
            <Select
              placeholder="Filtrar por ação"
              data={actionOptions}
              value={action}
              onChange={(v) => {
                setAction(v as PropertyHistoryAction | null);
                resetPage();
              }}
              clearable
              w={200}
              size="xs"
            />
            <TextInput
              placeholder="ID do usuário (sub do JWT)"
              leftSection={<IconSearch size={13} />}
              value={userId}
              onChange={(e) => {
                setUserId(e.currentTarget.value);
                resetPage();
              }}
              w={240}
              size="xs"
            />
          </Group>
        </Paper>

        {isError && (
          <Text c="red" size="sm" mb={16}>
            {extractErrorMessage(error, 'Não foi possível carregar o histórico.')}
          </Text>
        )}

        <Paper style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <Group justify="center" p="xl">
              <Loader size="sm" />
            </Group>
          ) : (
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Data/Hora</Table.Th>
                  <Table.Th>Ação</Table.Th>
                  <Table.Th>Imóvel</Table.Th>
                  <Table.Th>Usuário</Table.Th>
                  <Table.Th>Correlation ID</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(data?.data ?? []).map((entry) => {
                  const property = propertyById.get(entry.entityId);
                  return (
                    <Table.Tr key={entry.id} onClick={() => setSelected(entry)} style={{ cursor: 'pointer' }}>
                      <Table.Td>
                        <Text size="xs">{formatDateTime(entry.timestamp)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={actionColor[entry.action]} size="sm">
                          {propertyHistoryActionLabels[entry.action]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" ff="monospace">
                          {property?.registrationNumber ?? entry.entityId.slice(0, 8)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" ff="monospace" c="dimmed">
                          {entry.userId.slice(0, 8)}…
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" ff="monospace" c="dimmed">
                          {entry.correlationId ? `${entry.correlationId.slice(0, 8)}…` : '—'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                {!isLoading && (data?.data.length ?? 0) === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center" py="lg">
                        Nenhum registro de histórico encontrado para os filtros selecionados.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          )}
          {totalPages > 1 && (
            <Group justify="center" p="14px 20px" style={{ borderTop: '1px solid #e0e0e0' }}>
              <Pagination total={totalPages} value={page} onChange={setPage} size="sm" color="brandGreen" />
            </Group>
          )}
        </Paper>
      </Box>

      <Drawer opened={selected !== null} onClose={() => setSelected(null)} position="right" size="480px" title="Detalhes da Alteração">
        {selected && (
          <Box>
            <Group mb={16} gap={8}>
              <Badge variant="light" color={actionColor[selected.action]}>
                {propertyHistoryActionLabels[selected.action]}
              </Badge>
              <Text size="xs" c="dimmed">
                {formatDateTime(selected.timestamp)}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" mb={4}>
              Usuário: <Text component="span" ff="monospace">{selected.userId}</Text>
            </Text>
            <Text size="xs" c="dimmed" mb={16}>
              Correlation ID: <Text component="span" ff="monospace">{selected.correlationId ?? '—'}</Text>
            </Text>

            <Text size="11px" tt="uppercase" fw={700} c="dimmed" mb={8} style={{ letterSpacing: 1.5 }}>
              O que mudou
            </Text>
            {diff.length === 0 ? (
              <Text size="sm" c="dimmed">
                Sem diferenças de campos registradas.
              </Text>
            ) : (
              <Table verticalSpacing={6} fz="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Campo</Table.Th>
                    <Table.Th>Antes</Table.Th>
                    <Table.Th>Depois</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {diff.map((row) => (
                    <Table.Tr key={row.field}>
                      <Table.Td ff="monospace">{row.field}</Table.Td>
                      <Table.Td c="dimmed">{formatDiffValue(row.before)}</Table.Td>
                      <Table.Td fw={600}>{formatDiffValue(row.after)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Box>
        )}
      </Drawer>
    </>
  );
}
