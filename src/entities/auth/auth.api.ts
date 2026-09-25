import { apiClient } from '@/shared/lib/api-client';
import type { MeResponse } from './auth.types';

export async function getMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/me');
  return data;
}
