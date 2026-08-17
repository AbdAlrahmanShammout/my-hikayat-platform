import type { JSX } from 'react';

import { PageSkeleton } from '@/components/page-skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

/**
 * Displays GET /auth/me fields. Does not invent publisher or entitlement rules.
 */
export function AuthorSessionSummary(): JSX.Element {
  const currentUserQuery = useCurrentUser();
  if (currentUserQuery.data === undefined) {
    return <PageSkeleton />;
  }
  const publisherLabel: string = currentUserQuery.data.isPublisher ? 'Yes' : 'No';
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signed-in account</CardTitle>
        <CardDescription>
          These values come from GET /auth/me. The API remains authoritative for publisher
          capability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="text-sm font-medium">{currentUserQuery.data.email}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">Role</dt>
            <dd className="text-sm font-medium">{currentUserQuery.data.role}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">Publisher</dt>
            <dd className="text-sm font-medium">{publisherLabel}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
