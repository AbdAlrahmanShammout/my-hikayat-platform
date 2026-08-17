import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';

/**
 * Shown when a signed-in non-admin reaches /admin. Hiding routes is not security.
 */
export function ForbiddenPanel(): JSX.Element {
  const signOut = useSignOut();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex max-w-md flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          This dashboard is for administrators. Your account does not have the admin role. Sign out
          and use an admin account, or return later when author tools are available.
        </p>
        <Button type="button" variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
