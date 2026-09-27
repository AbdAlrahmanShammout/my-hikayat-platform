import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  Link2,
  Package,
  Receipt,
  Scale,
  ScrollText,
  Tags,
  UserPlus,
  Users,
} from 'lucide-react';

export type AdminNavLinkItem = {
  readonly kind: 'link';
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

export type AdminNavGroupItem = {
  readonly kind: 'group';
  readonly label: string;
  readonly icon: LucideIcon;
  readonly children: readonly {
    readonly to: string;
    readonly label: string;
  }[];
};

export type AdminNavItem = AdminNavLinkItem | AdminNavGroupItem;

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { kind: 'link', to: '/admin', label: 'Home', icon: LayoutDashboard },
  { kind: 'link', to: '/admin/books', label: 'Books', icon: BookOpen },
  {
    kind: 'group',
    label: 'Users',
    icon: Users,
    children: [
      { to: '/admin/users/admins', label: 'Admins' },
      { to: '/admin/users/members', label: 'Members' },
    ],
  },
  { kind: 'link', to: '/admin/invitations', label: 'Invitations', icon: UserPlus },
  { kind: 'link', to: '/admin/plans', label: 'Plans', icon: Package },
  { kind: 'link', to: '/admin/subscriptions', label: 'Subscriptions', icon: Receipt },
  { kind: 'link', to: '/admin/collections', label: 'Collections', icon: FolderKanban },
  { kind: 'link', to: '/admin/categories', label: 'Categories', icon: Tags },
  { kind: 'link', to: '/admin/settings', label: 'Settings', icon: Link2 },
  { kind: 'link', to: '/admin/revenue', label: 'Revenue', icon: Scale },
  { kind: 'link', to: '/admin/audit', label: 'Audit', icon: ScrollText },
];
