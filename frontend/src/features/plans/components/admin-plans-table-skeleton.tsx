import type { JSX } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Table-shaped placeholder for the admin plans list.
 */
export function AdminPlansTableSkeleton(): JSX.Element {
  return (
    <div className="space-y-3" aria-busy="true">
      <span className="sr-only">Loading plans</span>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
