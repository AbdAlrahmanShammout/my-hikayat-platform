import type { JSX } from 'react';
import { Link } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminPublisherSummary } from '@/features/publishers/hooks/use-admin-publisher-summary';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import { formatCents } from '@/lib/format-cents';
import { formatWireInstant } from '@/lib/format-wire-instant';

/**
 * Publisher-account summary. Counts come from the summary endpoint.
 */
export function AdminPublisherSummaryPanel({ userId }: { readonly userId: number }): JSX.Element {
  const summaryQuery = useAdminPublisherSummary(userId);
  if (summaryQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading publisher summary…</p>;
  }
  if (summaryQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(summaryQuery.error)}
        onRetry={() => {
          void summaryQuery.refetch();
        }}
      />
    );
  }
  const summary = summaryQuery.data;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Publisher account</CardTitle>
          <CardDescription>
            This is a user account with publisher capability. EPUB creator and EPUB publisher on a
            book are metadata strings, not this account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Email">{summary.email}</Item>
            <Item label="Display name">{summary.displayName ?? 'No display name'}</Item>
            <Item label="Role">{summary.role}</Item>
            <Item label="Created">{formatWireInstant(summary.createdAt)}</Item>
            <Item label="Books">{String(summary.total)}</Item>
            <Item label="Catalog visible">{String(summary.catalogVisible)}</Item>
            <Item label="Approved, not published">{String(summary.unpublishedApprovedCount)}</Item>
            <Item label="Lifetime author cents">{`${formatCents(summary.lifetimeAuthorCents)} (${String(summary.lifetimeAuthorCents)} cents)`}</Item>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Publishing status</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.publishingStatusCounts.length === 0 ? (
            <EmptyState title="No status counts" description="This account has no books to count." />
          ) : (
            <ul className="space-y-2 text-sm">
              {summary.publishingStatusCounts.map((row) => (
                <li key={row.publishingStatus}>
                  {`${formatBookEnumLabel(row.publishingStatus)}: ${String(row.count)}`}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent books</CardTitle>
          <CardDescription>EPUB creator and EPUB publisher are metadata on the book.</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.recentBooks.length === 0 ? (
            <EmptyState title="No recent books" description="This publisher account has no books yet." />
          ) : (
            <ul className="space-y-3">
              {summary.recentBooks.map((book) => (
                <li key={book.id} className="text-sm">
                  <Link className="font-medium underline-offset-4 hover:underline" to={`/admin/books/${book.id}`}>
                    {book.title}
                  </Link>
                  <p className="text-muted-foreground">
                    {`${formatBookEnumLabel(book.publishingStatus)} · EPUB creator: ${book.authorName ?? 'none'} · EPUB publisher: ${book.publisherName ?? 'none'}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Revenue periods</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {summary.revenuePeriodLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revenue period links.</p>
          ) : (
            summary.revenuePeriodLinks.map((periodId) => (
              <Button key={periodId} asChild variant="outline" size="sm">
                <Link to={`/admin/revenue/${periodId}`}>{`Period ${String(periodId)}`}</Link>
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Item({ label, children }: { readonly label: string; readonly children: string }): JSX.Element {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
