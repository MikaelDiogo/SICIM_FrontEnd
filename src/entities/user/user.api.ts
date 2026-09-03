import { apiClient } from '@/shared/lib/api-client';
import type { RegisterUserInput, User } from './user.types';

export async function registerUser(input: RegisterUserInput): Promise<User> {
  const { data } = await apiClient.post<User>('/users', input);
  return data;
}
