import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  Receipt,
  Scale,
  ScrollText,
  Tags,
  Users,
} from 'lucide-react';

export type AdminNavItem = {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard },
  { to: '/admin/books', label: 'Books', icon: BookOpen },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: Receipt },
  { to: '/admin/collections', label: 'Collections', icon: FolderKanban },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/revenue', label: 'Revenue', icon: Scale },
  { to: '/admin/audit', label: 'Audit', icon: ScrollText },
];
