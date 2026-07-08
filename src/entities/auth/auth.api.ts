import { apiClient } from '@/shared/lib/api-client';
import type { LoginCredentials, LoginResponse } from './auth.types';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return data;
}
