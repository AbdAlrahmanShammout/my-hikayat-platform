import type { JSX } from 'react';
import { Link, useParams } from 'react-router';

import { ErrorState } from '@/components/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { AdminPublisherSummaryPanel } from '@/features/publishers/components/admin-publisher-summary-panel';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Publisher account summary from GET /admin/publishers/:userId/summary.
 */
export function AdminPublisherSummaryPage(): JSX.Element {
  const { userId: userIdParam } = useParams();
  const userId: number | null = parsePositiveInt(userIdParam);
  if (userId === null) {
    return (
      <>
        <PageHeader title="Publisher account" description="Summary for one publisher account." />
        <ErrorState title="Invalid user id" message="The user id in the URL must be a positive integer." />
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Publisher account"
        description="Book totals, catalog visibility, and lifetime author cents come from the summary API."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/publishers">Back to publisher accounts</Link>
          </Button>
        }
      />
      <AdminPublisherSummaryPanel userId={userId} />
    </>
  );
}
