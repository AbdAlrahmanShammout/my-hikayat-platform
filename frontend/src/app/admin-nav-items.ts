import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  LayoutDashboard,
  Receipt,
  ScrollText,
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
  readonly activePathPrefixes: readonly string[];
  readonly children: readonly {
    readonly to: string;
    readonly label: string;
  }[];
};

export type AdminNavItem = AdminNavLinkItem | AdminNavGroupItem;

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { kind: 'link', to: '/admin', label: 'Home', icon: LayoutDashboard },
  {
    kind: 'group',
    label: 'Catalog',
    icon: BookOpen,
    activePathPrefixes: ['/admin/books', '/admin/collections', '/admin/categories'],
    children: [
      { to: '/admin/books', label: 'Books' },
      { to: '/admin/collections', label: 'Collections' },
      { to: '/admin/categories', label: 'Categories' },
    ],
  },
  {
    kind: 'group',
    label: 'People',
    icon: Users,
    activePathPrefixes: ['/admin/users', '/admin/publishers', '/admin/invitations'],
    children: [
      { to: '/admin/users/members', label: 'Members' },
      { to: '/admin/users/admins', label: 'Admins' },
      { to: '/admin/publishers', label: 'Publisher accounts' },
      { to: '/admin/invitations', label: 'Invitations' },
    ],
  },
  {
    kind: 'group',
    label: 'Access & Billing',
    icon: Receipt,
    activePathPrefixes: ['/admin/plans', '/admin/subscriptions', '/admin/revenue'],
    children: [
      { to: '/admin/plans', label: 'Plans' },
      { to: '/admin/subscriptions', label: 'Subscriptions' },
      { to: '/admin/revenue', label: 'Revenue' },
    ],
  },
  {
    kind: 'group',
    label: 'Operations',
    icon: ScrollText,
    activePathPrefixes: [
      '/admin/reading',
      '/admin/exports',
      '/admin/search',
      '/admin/audit',
      '/admin/settings',
    ],
    children: [
      { to: '/admin/reading', label: 'Reading minutes' },
      { to: '/admin/exports', label: 'Exports' },
      { to: '/admin/search', label: 'Search' },
      { to: '/admin/audit', label: 'Audit' },
      { to: '/admin/settings', label: 'Settings' },
    ],
  },
];
