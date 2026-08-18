import type { LucideIcon } from 'lucide-react';
import { BarChart3, BookOpen, LayoutDashboard, Wallet } from 'lucide-react';

export type AuthorNavItem = {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

export const AUTHOR_NAV_ITEMS: readonly AuthorNavItem[] = [
  { to: '/author', label: 'Home', icon: LayoutDashboard },
  { to: '/author/books', label: 'Books', icon: BookOpen },
  { to: '/author/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/author/earnings', label: 'Earnings', icon: Wallet },
];
