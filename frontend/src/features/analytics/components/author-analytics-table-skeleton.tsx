import type { JSX } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Table-shaped placeholder for author analytics rows.
 */
export function AuthorAnalyticsTableSkeleton(): JSX.Element {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading analytics</span>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
