import type { FormEvent, JSX } from 'react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { useAdminDashboardReading } from '@/features/dashboard/hooks/use-admin-dashboard-reading';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import { parsePositiveInt } from '@/lib/parse-positive-int';

/**
 * Book-level reading minutes from GET /admin/dashboard/reading.
 * The headline total is the API field, not a sum of the visible rows.
 */
export function AdminReadingDrilldownPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const offset: number = parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0;
  const ownerId: number | undefined = parsePositiveInt(searchParams.get('ownerId') ?? undefined) ?? undefined;
  const readingQuery = useAdminDashboardReading({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset,
    ownerId,
  });
  return (
    <div className="space-y-6">
      <OwnerFilter
        key={ownerId ?? 'all'}
        ownerId={ownerId}
        onApply={(nextOwnerId: number | undefined) => {
          const params: URLSearchParams = new URLSearchParams();
          if (nextOwnerId !== undefined) {
            params.set('ownerId', String(nextOwnerId));
          }
          setSearchParams(params, { replace: true });
        }}
      />
      {renderReadingBody(readingQuery, offset, ownerId, (nextOffset: number) => {
        const params: URLSearchParams = new URLSearchParams(searchParams);
        if (nextOffset > 0) {
          params.set('offset', String(nextOffset));
        } else {
          params.delete('offset');
        }
        setSearchParams(params, { replace: true });
      })}
    </div>
  );
}

function renderReadingBody(
  readingQuery: ReturnType<typeof useAdminDashboardReading>,
  offset: number,
  ownerId: number | undefined,
  onOffsetChange: (offset: number) => void,
): JSX.Element {
  if (readingQuery.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (readingQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(readingQuery.error)}
        onRetry={() => {
          void readingQuery.refetch();
        }}
      />
    );
  }
  const reading = readingQuery.data;
  return (
    <div className="space-y-4">
      <p className="text-sm">
        {`Total reading minutes: ${String(reading.totalReadingMinutes)}. Books with engagement: ${String(reading.total)}.`}
      </p>
      <p className="text-sm text-muted-foreground">
        The total is the reading engagement total from the API
        {ownerId === undefined ? ' for the platform' : ' for this owner'}. This page does not add
        the visible rows together, and it is not revenue.
      </p>
      {reading.bookEngagements.length === 0 ? (
        <EmptyState
          title="No reading engagement"
          description="Minutes stay at the API total until book engagement has been aggregated."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book</TableHead>
              <TableHead>Owner account</TableHead>
              <TableHead>Reading minutes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reading.bookEngagements.map((book) => (
              <TableRow key={book.bookId}>
                <TableCell>
                  <Link className="underline-offset-4 hover:underline" to={`/admin/books/${book.bookId}`}>
                    {book.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link className="underline-offset-4 hover:underline" to={`/admin/users/${book.ownerId}`}>
                    {String(book.ownerId)}
                  </Link>
                </TableCell>
                <TableCell>{String(book.readingMinutes)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ListPagination
        offset={offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={reading.total}
        onOffsetChange={onOffsetChange}
      />
    </div>
  );
}

function OwnerFilter({
  ownerId,
  onApply,
}: {
  readonly ownerId: number | undefined;
  readonly onApply: (ownerId: number | undefined) => void;
}): JSX.Element {
  const [draft, setDraft] = useState<string>(ownerId === undefined ? '' : String(ownerId));
  const [error, setError] = useState<string | undefined>(undefined);
  return (
    <form
      className="flex max-w-md flex-col gap-2"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed: string = draft.trim();
        if (trimmed === '') {
          setError(undefined);
          onApply(undefined);
          return;
        }
        const parsed: number | null = parsePositiveInt(trimmed);
        if (parsed === null) {
          setError('Enter a publisher account id, or leave this empty for the platform total.');
          return;
        }
        setError(undefined);
        onApply(parsed);
      }}
    >
      <Label htmlFor="reading-owner">Publisher account id</Label>
      <div className="flex gap-2">
        <Input id="reading-owner" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </div>
      {error !== undefined ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
