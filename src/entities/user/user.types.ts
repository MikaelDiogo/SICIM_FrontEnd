import type { Role } from '@/shared/types/enums';

export interface User {
  id: string;
  name: string;
  employeeNumber: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface RegisterUserInput {
  name: string;
  employeeNumber: string;
  email: string;
  password: string;
  role: Role;
}
