import {
  LayoutDashboard,
  Clock,
  Users,
  Truck,
  FileText,
  CreditCard,
  DollarSign,
  BarChart3,
  History,
  Wallet,
  CheckCircle,
  Package
} from 'lucide-react';
import { User } from '@/types';

export type UserRole = User['role'];

export interface NavItemConfig {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItemConfig[];
}

const adminMenu: NavItemConfig[] = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Solicitações', url: '/solicitacoes', icon: Clock, badge: 'solicitacoes' },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Entregadores', url: '/entregadores', icon: Truck },
  { title: 'Entregas', url: '/entregas', icon: FileText },
  {
    title: 'Faturas',
    url: '/faturas',
    icon: CreditCard,
    children: [
      { title: 'Gerenciamento', url: '/faturas', icon: CreditCard },
      { title: 'Finalizadas', url: '/faturas/finalizadas', icon: CheckCircle },
    ],
  },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
];

const clienteMenu: NavItemConfig[] = [
  { title: 'Início', url: '/cliente', icon: LayoutDashboard },
  { title: 'Minhas Solicitações', url: '/cliente/solicitacoes', icon: Package },
  { title: 'Financeiro', url: '/cliente/financeiro', icon: Wallet },
];

const entregadorMenu: NavItemConfig[] = [
  { title: 'Minhas Entregas', url: '/entregador', icon: Truck },
  { title: 'Histórico', url: '/entregador/historico', icon: History },
  { title: 'Financeiro', url: '/entregador/financeiro', icon: DollarSign },
];

export const navigationConfig: Record<UserRole, NavItemConfig[]> = {
  admin: adminMenu,
  cliente: clienteMenu,
  entregador: entregadorMenu,
};
