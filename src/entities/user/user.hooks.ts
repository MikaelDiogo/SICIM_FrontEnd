import { useMutation } from '@tanstack/react-query';
import { registerUser } from './user.api';
import type { RegisterUserInput } from './user.types';

export function useRegisterUser() {
  return useMutation({
    mutationFn: (input: RegisterUserInput) => registerUser(input),
  });
}
