import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  PasswordInput,
  Select,
  SimpleGrid,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconUserPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useRegisterUser } from '@/entities/user/user.hooks';
import type { RegisterUserInput } from '@/entities/user/user.types';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { Role, roleLabels } from '@/shared/types/enums';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PAGE_GUTTER_X } from '@/shared/ui/layout-constants';

const roleOptions = (Object.keys(roleLabels) as Role[]).map((value) => ({
  value,
  label: roleLabels[value],
}));

const roleDescriptions: Record<Role, string> = {
  [Role.REGISTRATION]: 'Cadastra e edita imóveis. Os registros ficam pendentes de aprovação.',
  [Role.VIEWER]: 'Somente leitura — acessa dashboard, mapa e relatórios.',
  [Role.APPROVAL]: 'Tudo do perfil Cadastro, mais aprovar e inativar imóveis.',
  [Role.ADMINISTRATION]: 'Acesso total: cadastro, aprovação, usuários e configurações.',
};

interface UserFormValues {
  name: string;
  employeeNumber: string;
  email: string;
  password: string;
  role: Role;
}

export function UsersPage() {
  const { mutateAsync, isPending } = useRegisterUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    initialValues: {
      name: '',
      employeeNumber: '',
      email: '',
      password: '',
      role: Role.VIEWER,
    },
    validate: {
      name: (v) => (v.trim().length < 3 ? 'Nome deve ter ao menos 3 caracteres' : null),
      employeeNumber: (v) => (v.trim() ? null : 'Matrícula obrigatória'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'E-mail inválido'),
      password: (v) => (v.length >= 8 ? null : 'Senha deve ter ao menos 8 caracteres'),
      role: (v) => (v ? null : 'Perfil obrigatório'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessUser(null);
    try {
      const user = await mutateAsync(values as RegisterUserInput);
      setSuccessUser(user.name);
      form.reset();
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Não foi possível cadastrar o usuário.'));
    }
  });

  const selectedRole = form.values.role;

  return (
    <>
      <PageHeader eyebrow="Administração" title="Usuários" subtitle="Cadastro de usuários do sistema" />

      <Box p={`24px ${PAGE_GUTTER_X}px`}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={24}>
        {/* Formulário */}
        <Paper p={24}>
          <Title order={5} mb={20}>
            Novo Usuário
          </Title>

          {errorMessage && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
              {errorMessage}
            </Alert>
          )}
          {successUser && (
            <Alert color="green" icon={<IconCheck size={16} />} mb="md">
              Usuário <strong>{successUser}</strong> cadastrado com sucesso.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextInput label="Nome completo" mb={12} {...form.getInputProps('name')} />
            <SimpleGrid cols={2} mb={12}>
              <TextInput label="Matrícula funcional" {...form.getInputProps('employeeNumber')} />
              <TextInput label="E-mail" type="email" {...form.getInputProps('email')} />
            </SimpleGrid>
            <PasswordInput label="Senha" mb={12} {...form.getInputProps('password')} />
            <Select label="Perfil de acesso" data={roleOptions} mb={20} {...form.getInputProps('role')} />

            <Group justify="flex-end">
              <Button
                type="submit"
                color="brandGreen"
                loading={isPending}
                leftSection={<IconUserPlus size={14} />}
              >
                Cadastrar Usuário
              </Button>
            </Group>
          </form>
        </Paper>

        {/* Tabela de perfis */}
        <Paper p={24}>
          <Title order={5} mb={20}>
            Perfis de Acesso
          </Title>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(Object.keys(roleLabels) as Role[]).map((role) => (
              <Box
                key={role}
                p="12px 16px"
                style={{
                  border: `1px solid ${selectedRole === role ? '#1A5C2A' : '#ededed'}`,
                  borderRadius: 8,
                  background: selectedRole === role ? '#f0f7f2' : '#fafafa',
                  transition: 'all 0.15s ease',
                }}
              >
                <Group gap={8} mb={4}>
                  <Badge
                    size="sm"
                    color={role === Role.ADMINISTRATION ? 'red' : role === Role.APPROVAL ? 'orange' : role === Role.REGISTRATION ? 'blue' : 'gray'}
                  >
                    {roleLabels[role]}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  {roleDescriptions[role]}
                </Text>
              </Box>
            ))}
          </Box>
        </Paper>
      </SimpleGrid>
      </Box>
    </>
  );
}
