import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/entities/auth/auth-context';
import { extractErrorMessage } from '@/shared/lib/api-client';
import { loginSchema, type LoginFormValues } from './login-schema';

export function LoginForm() {
  const { signIn, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    validate: schemaResolver(loginSchema),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setErrorMessage(null);
    try {
      await signIn(values);
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'E-mail ou senha inválidos.'));
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {errorMessage && (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />}>
            {errorMessage}
          </Alert>
        )}
        <TextInput
          label="E-mail institucional"
          placeholder="usuario@crateus.ce.gov.br"
          {...form.getInputProps('email')}
        />
        <PasswordInput label="Senha" placeholder="••••••••" {...form.getInputProps('password')} />
        <Button type="submit" loading={isLoggingIn} fullWidth color="brandGreen" mt="sm">
          Entrar
        </Button>
      </Stack>
    </form>
  );
}
