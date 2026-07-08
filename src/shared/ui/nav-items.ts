import {
  IconChartBar,
  IconFileText,
  IconLayoutDashboard,
  IconMap2,
  IconPlus,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';

export interface NavItem {
  label: string;
  to: string;
  icon: typeof IconLayoutDashboard;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  { label: 'Painel Geral', to: '/', icon: IconLayoutDashboard },
  { label: 'Mapa Territorial', to: '/mapa', icon: IconMap2 },
  { label: 'Novo Cadastro', to: '/imoveis/novo', icon: IconPlus },
  { label: 'Relatórios', to: '/relatorios', icon: IconFileText },
  { label: 'Indicadores', to: '#', icon: IconChartBar, disabled: true },
  { label: 'Usuários', to: '#', icon: IconUsers, disabled: true },
  { label: 'Configurações', to: '#', icon: IconSettings, disabled: true },
];
