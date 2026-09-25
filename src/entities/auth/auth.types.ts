import type { SicimRole } from '@/shared/types/enums';

// Perfil autenticado: id/username/roles vêm de GET /me (JWT do Keycloak);
// name/email vêm dos claims do token (preferred_username/name/email).
export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  roles: SicimRole[];
}

export interface MeResponse {
  id: string;
  username: string;
  roles: SicimRole[];
}
