import type { Role } from '@/shared/types/enums';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}
