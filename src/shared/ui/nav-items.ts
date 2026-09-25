import {
  IconFileText,
  IconLayoutDashboard,
  IconMap2,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import type { SicimRole } from '@/shared/types/enums';

export interface NavItem {
  label: string;
  to: string;
  icon: typeof IconLayoutDashboard;
  disabled?: boolean;
  roles?: SicimRole[];
}

export const navItems: NavItem[] = [
  { label: 'Painel Geral', to: '/', icon: IconLayoutDashboard },
  { label: 'Mapa Territorial', to: '/mapa', icon: IconMap2 },
  { label: 'Novo Cadastro', to: '/imoveis/novo', icon: IconPlus },
  { label: 'Relatórios', to: '/relatorios', icon: IconFileText },
  { label: 'Unidades', to: '/configuracoes/unidades-gestoras', icon: IconSettings, roles: ['SICIM_ADMIN'] },
];
