import axios, { AxiosError } from 'axios';
import { getFreshToken, keycloak } from './keycloak';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1/sicim',
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getFreshToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      keycloak.login();
    }
    return Promise.reject(error);
  },
);

// Uma por intenção de negócio (cadastrar/aprovar/... um imóvel) — reutilize o mesmo id
// em todas as chamadas daquele fluxo. Fica gravado no histórico do imóvel. Ver API.md.
export function newCorrelationId(): string {
  return crypto.randomUUID();
}

export function correlationHeader(correlationId: string) {
  return { 'X-Correlation-Id': correlationId };
}

// Corpo de erro em Problem Details (RFC 7807) com propriedade extra `message`. Ver API.md.
export interface ApiErrorBody {
  message: string | string[];
  error?: string;
  statusCode: number;
}

export function extractErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(' ') : body.message;
    }
  }
  return fallback;
}
