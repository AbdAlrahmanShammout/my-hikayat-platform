import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CreditCard,
  Download,
  FileSearch,
  Layers,
  LayoutDashboard,
  Mail,
  RefreshCw,
  ScrollText,
  Settings,
  Shield,
  Tag,
  Timer,
  Users,
  Wallet,
} from 'lucide-react';

export type AdminNavLinkItem = {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly end?: boolean;
};

export type AdminNavGroupItem = {
  readonly label: string;
  readonly children: readonly AdminNavLinkItem[];
};

export type AdminNavItem =
  | { readonly kind: 'link'; readonly item: AdminNavLinkItem }
  | { readonly kind: 'group'; readonly item: AdminNavGroupItem };

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    kind: 'link',
    item: { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  },
  {
    kind: 'group',
    item: {
      label: 'Catalog',
      children: [
        { to: '/admin/books', label: 'Books', icon: BookOpen },
        { to: '/admin/collections', label: 'Collections', icon: Layers },
        { to: '/admin/categories', label: 'Categories', icon: Tag },
      ],
    },
  },
  {
    kind: 'group',
    item: {
      label: 'People',
      children: [
        { to: '/admin/users/members', label: 'Members', icon: Users },
        { to: '/admin/users/admins', label: 'Admins', icon: Shield },
        { to: '/admin/invitations', label: 'Invitations', icon: Mail },
        { to: '/admin/publishers', label: 'Publisher accounts', icon: Users },
      ],
    },
  },
  {
    kind: 'group',
    item: {
      label: 'Access & billing',
      children: [
        { to: '/admin/plans', label: 'Plans', icon: CreditCard },
        { to: '/admin/subscriptions', label: 'Subscriptions', icon: RefreshCw },
      ],
    },
  },
  {
    kind: 'group',
    item: {
      label: 'Operations',
      children: [
        { to: '/admin/revenue', label: 'Revenue', icon: Wallet },
        { to: '/admin/reading', label: 'Reading minutes', icon: Timer },
        { to: '/admin/exports', label: 'Exports', icon: Download },
        { to: '/admin/search', label: 'Search', icon: FileSearch },
        { to: '/admin/audit', label: 'Audit Log', icon: ScrollText },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ],
    },
  },
];
