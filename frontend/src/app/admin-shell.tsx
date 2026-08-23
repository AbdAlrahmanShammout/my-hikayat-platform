import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';

import { ADMIN_NAV_ITEMS, type AdminNavItem } from '@/app/admin-nav-items';
import { ConstrainedContent } from '@/components/layout/constrained-content';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';
import { cn } from '@/lib/cn';

/**
 * Protected admin chrome: sidebar on desktop, drawer on small screens.
 */
export function AdminShell(): JSX.Element {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const closeMobileNav = (): void => {
    setIsMobileNavOpen(false);
  };
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <AdminSidebar onNavigate={closeMobileNav} />
      </aside>
      <MobileAdminDrawer isOpen={isMobileNavOpen} onClose={closeMobileNav} />
      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => {
              setIsMobileNavOpen(true);
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <p className="hidden text-sm font-medium md:block">Admin</p>
          <AdminSessionActions />
        </header>
        <main className="flex-1 p-4 md:p-8">
          <ConstrainedContent>
            <Outlet />
          </ConstrainedContent>
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({ onNavigate }: { readonly onNavigate: () => void }): JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6">
        <p className="text-lg font-semibold tracking-tight">Noory</p>
        <p className="text-xs text-sidebar-muted">Admin dashboard</p>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex flex-col gap-1 p-4" aria-label="Admin">
        {ADMIN_NAV_ITEMS.map((item) => (
          <AdminNavLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

function AdminNavLink({
  item,
  onNavigate,
}: {
  readonly item: AdminNavItem;
  readonly onNavigate: () => void;
}): JSX.Element {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-foreground'
            : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground',
        )
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

function MobileAdminDrawer({
  isOpen,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}): JSX.Element {
  const shouldReduceMotion: boolean | null = useReducedMotion();
  const duration: number = shouldReduceMotion === true ? 0 : 0.2;
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground md:hidden"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration }}
          >
            <div className="flex justify-end p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={onClose}
              >
                <X className="h-5 w-5 text-sidebar-foreground" />
              </Button>
            </div>
            <AdminSidebar onNavigate={onClose} />
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function AdminSessionActions(): JSX.Element {
  const currentUserQuery = useCurrentUser();
  const signOut = useSignOut();
  const email: string = currentUserQuery.data?.email ?? '';
  return (
    <div className="ml-auto flex items-center gap-3">
      {email !== '' ? (
        <p className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">{email}</p>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
