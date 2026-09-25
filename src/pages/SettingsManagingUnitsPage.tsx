import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useCreateManagingUnit, useDeactivateManagingUnit, useManagingUnits } from '@/entities/managing-unit/managing-unit.hooks';
import type { CreateManagingUnitInput } from '@/entities/managing-unit/managing-unit.types';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { ManagingUnitType, managingUnitTypeLabels } from '@/shared/types/enums';
import { PAGE_GUTTER_X } from '@/shared/ui/layout-constants';
import { PageHeader } from '@/shared/ui/PageHeader';

const typeOptions = (Object.keys(managingUnitTypeLabels) as ManagingUnitType[]).map((value) => ({
  value,
  label: managingUnitTypeLabels[value],
}));

export function SettingsManagingUnitsPage() {
  const { data: units = [], isLoading } = useManagingUnits();
  const createMutation = useCreateManagingUnit();
  const deactivateMutation = useDeactivateManagingUnit();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CreateManagingUnitInput>({
    initialValues: { name: '', acronym: '', type: ManagingUnitType.SECRETARIAT },
    validate: {
      name: (v) => (v.trim().length < 3 ? 'Nome deve ter ao menos 3 caracteres' : null),
      acronym: (v) => (v.trim() ? null : 'Sigla obrigatória'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setErrorMessage(null);
    try {
      await createMutation.mutateAsync(values);
      form.reset();
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Não foi possível cadastrar a unidade gestora.'));
    }
  });

  const handleDeactivate = async (id: string) => {
    setErrorMessage(null);
    try {
      await deactivateMutation.mutateAsync(id);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Não foi possível excluir a unidade gestora.'));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Cadastros"
        title="Unidades Gestoras"
        subtitle="Órgãos disponíveis para vincular no cadastro de imóveis."
      />
      <Box p={`24px ${PAGE_GUTTER_X}px 60px`}>
        {errorMessage && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
            {errorMessage}
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={24}>
          <Paper p={24}>
            <Title order={5} mb={20}>
              Nova Unidade Gestora
            </Title>
            <form onSubmit={handleSubmit}>
              <TextInput label="Nome" placeholder="Secretaria de..." mb={12} {...form.getInputProps('name')} />
              <SimpleGrid cols={2} mb={20}>
                <TextInput label="Sigla" placeholder="SEAD" {...form.getInputProps('acronym')} />
                <Select label="Tipo" data={typeOptions} {...form.getInputProps('type')} />
              </SimpleGrid>
              <Group justify="flex-end">
                <Button type="submit" color="brandGreen" loading={createMutation.isPending} leftSection={<IconPlus size={14} />}>
                  Adicionar
                </Button>
              </Group>
            </form>
          </Paper>

          <Paper p={24}>
            <Title order={5} mb={20}>
              Unidades Cadastradas ({units.length})
            </Title>
            <Table verticalSpacing={8}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Sigla</Table.Th>
                  <Table.Th>Nome</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {units.map((unit) => (
                  <Table.Tr key={unit.id}>
                    <Table.Td>
                      <Badge variant="light" color="brandGreen">
                        {unit.acronym}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{unit.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {managingUnitTypeLabels[unit.type]}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="Excluir">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeactivate(unit.id)}
                          loading={deactivateMutation.isPending && deactivateMutation.variables === unit.id}
                          aria-label="Excluir unidade gestora"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {!isLoading && units.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text size="xs" c="dimmed" ta="center" p={20}>
                        Nenhuma unidade gestora cadastrada.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </SimpleGrid>
      </Box>
    </>
  );
}
