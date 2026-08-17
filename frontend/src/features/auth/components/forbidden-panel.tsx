import type { JSX } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';

type ForbiddenPanelProps = {
  readonly title: string;
  readonly description: string;
  readonly homePath?: string;
  readonly homeLabel?: string;
};

/**
 * Shown when a signed-in account cannot use the current audience area.
 * Hiding routes is not security.
 */
export function ForbiddenPanel({
  title,
  description,
  homePath,
  homeLabel = 'Go to your dashboard',
}: ForbiddenPanelProps): JSX.Element {
  const signOut = useSignOut();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex max-w-md flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {homePath !== undefined ? (
          <Button asChild>
            <Link to={homePath}>{homeLabel}</Link>
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
