// Espelha exatamente os enums do backend (src/modules/**/domain/enums).
// Qualquer novo valor de enum no backend precisa ser refletido aqui.

export const UsageCategory = {
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  EDUCATIONAL: 'EDUCATIONAL',
  HEALTH: 'HEALTH',
  SOCIAL_ASSISTANCE: 'SOCIAL_ASSISTANCE',
  CULTURAL: 'CULTURAL',
  OTHER: 'OTHER',
} as const;
export type UsageCategory = (typeof UsageCategory)[keyof typeof UsageCategory];

export const usageCategoryLabels: Record<UsageCategory, string> = {
  ADMINISTRATIVE: 'Administrativo',
  EDUCATIONAL: 'Educacional',
  HEALTH: 'Saúde',
  SOCIAL_ASSISTANCE: 'Assistencial',
  CULTURAL: 'Cultural',
  OTHER: 'Outro',
};

export const PossessionType = {
  OWNED: 'OWNED',
  RENTED: 'RENTED',
  GRANTED: 'GRANTED',
  LOAN: 'LOAN',
  USUFRUCT: 'USUFRUCT',
  USE_PERMIT: 'USE_PERMIT',
} as const;
export type PossessionType = (typeof PossessionType)[keyof typeof PossessionType];

export const possessionTypeLabels: Record<PossessionType, string> = {
  OWNED: 'Próprio',
  RENTED: 'Alugado',
  GRANTED: 'Cedido',
  LOAN: 'Comodato',
  USUFRUCT: 'Usufruto',
  USE_PERMIT: 'Permissão de Uso',
};

export const PropertyStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  INACTIVE: 'INACTIVE',
} as const;
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  DRAFT: 'Rascunho',
  PENDING_APPROVAL: 'Pendente de Aprovação',
  APPROVED: 'Aprovado',
  INACTIVE: 'Inativo',
};

export const ManagingUnitType = {
  SECRETARIAT: 'SECRETARIAT',
  AUTARCHY: 'AUTARCHY',
  FOUNDATION: 'FOUNDATION',
} as const;
export type ManagingUnitType = (typeof ManagingUnitType)[keyof typeof ManagingUnitType];

export const managingUnitTypeLabels: Record<ManagingUnitType, string> = {
  SECRETARIAT: 'Secretaria',
  AUTARCHY: 'Autarquia',
  FOUNDATION: 'Fundação',
};

// Roles do JWT do Keycloak (realm bcm-sdk), retornadas por GET /me. Ver API.md.
export const SicimRole = {
  ADMIN: 'SICIM_ADMIN',
  APPROVER: 'SICIM_APPROVER',
  REGISTRAR: 'SICIM_REGISTRAR',
  VIEWER: 'SICIM_VIEWER',
} as const;
export type SicimRole = (typeof SicimRole)[keyof typeof SicimRole];

export const sicimRoleLabels: Record<SicimRole, string> = {
  SICIM_ADMIN: 'Administrador',
  SICIM_APPROVER: 'Aprovador',
  SICIM_REGISTRAR: 'Cadastro',
  SICIM_VIEWER: 'Consulta',
};
