import {
  IconFileText,
  IconLayoutDashboard,
  IconMap2,
  IconPlus,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import type { Role } from '@/shared/types/enums';

export interface NavItem {
  label: string;
  to: string;
  icon: typeof IconLayoutDashboard;
  disabled?: boolean;
  roles?: Role[];
}

export const navItems: NavItem[] = [
  { label: 'Painel Geral', to: '/', icon: IconLayoutDashboard },
  { label: 'Mapa Territorial', to: '/mapa', icon: IconMap2 },
  { label: 'Novo Cadastro', to: '/imoveis/novo', icon: IconPlus },
  { label: 'Relatórios', to: '/relatorios', icon: IconFileText },
  { label: 'Usuários', to: '/usuarios', icon: IconUsers, roles: ['ADMINISTRATION'] },
  { label: 'Configurações', to: '#', icon: IconSettings, disabled: true },
];
