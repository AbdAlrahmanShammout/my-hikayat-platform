import type { JSX } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Table-shaped placeholder for the admin invitations list.
 */
export function AdminInvitationsTableSkeleton(): JSX.Element {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading invitations</span>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
