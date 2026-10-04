import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';

import { ADMIN_NAV_ITEMS, type AdminNavLinkItem } from '@/app/admin-nav-items';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { PRODUCT_NAME } from '@/config/product-name';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';
import { cn } from '@/lib/cn';

/**
 * Protected admin chrome matching the Direction C library catalog sidebar.
 */
export function AdminShell(): JSX.Element {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const closeMobileNav = (): void => {
    setIsMobileNavOpen(false);
  };
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <AdminSidebar onNavigate={closeMobileNav} />
      </aside>
      <MobileAdminDrawer isOpen={isMobileNavOpen} onClose={closeMobileNav} />
      <div className="admin-workspace flex min-h-screen flex-col md:pl-60">
        <header className="flex h-14 items-center border-b border-border bg-card px-4 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => {
              setIsMobileNavOpen(true);
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({ onNavigate }: { readonly onNavigate: () => void }): JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-[18px] py-4">
        <BrandLogo className="h-7 w-7 shrink-0 rounded-md" />
        <div className="min-w-0">
          <p className="truncate font-display text-[13px] font-semibold text-sidebar-foreground">{PRODUCT_NAME}</p>
          <p className="text-[10px] tracking-wide text-sidebar-muted uppercase">Admin</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto py-2" aria-label="Admin">
        {ADMIN_NAV_ITEMS.map((entry) =>
          entry.kind === 'group' ? (
            <div key={entry.item.label} className="mt-2.5">
              <p className="mx-[18px] mb-1 text-[9px] font-bold tracking-[0.1em] text-sidebar-group uppercase">
                {entry.item.label}
              </p>
              {entry.item.children.map((item) => (
                <AdminNavLink key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <AdminNavLink key={entry.item.to} item={entry.item} onNavigate={onNavigate} />
          ),
        )}
      </nav>
      <AdminSidebarFooter />
    </div>
  );
}

function AdminNavLink({
  item,
  onNavigate,
}: {
  readonly item: AdminNavLinkItem;
  readonly onNavigate: () => void;
}): JSX.Element {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end === true}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 border-l-[3px] px-[18px] py-[7px] text-[13px] leading-snug',
          isActive
            ? 'border-sidebar-indicator bg-sidebar-accent font-semibold text-sidebar-foreground'
            : 'border-transparent text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground',
        )
      }
    >
      <Icon className="h-[15px] w-[15px] shrink-0" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

function AdminSidebarFooter(): JSX.Element {
  const currentUserQuery = useCurrentUser();
  const signOut = useSignOut();
  const email: string = currentUserQuery.data?.email ?? '';
  const initial: string = email.slice(0, 1).toUpperCase() || 'A';
  return (
    <div className="flex items-center gap-2 border-t border-sidebar-border px-[18px] py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-sidebar-foreground">
        {initial}
      </div>
      <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-sidebar-foreground">{email}</p>
      <button
        type="button"
        className="shrink-0 text-sidebar-muted hover:text-sidebar-foreground"
        aria-label="Sign out"
        onClick={signOut}
      >
        <LogOut className="h-[15px] w-[15px]" aria-hidden="true" />
      </button>
    </div>
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
            className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar text-sidebar-foreground md:hidden"
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
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
