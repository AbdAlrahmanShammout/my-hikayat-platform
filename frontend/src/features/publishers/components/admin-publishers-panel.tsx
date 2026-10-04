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
import { Select } from '@/components/ui/select';
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
import { useAdminPublishersList } from '@/features/publishers/hooks/use-admin-publishers-list';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';

const PUBLISHER_SORT_FIELDS = ['createdAt', 'email', 'bookCount'] as const;

type PublisherListSearch = {
  readonly q: string | undefined;
  readonly sortBy: (typeof PUBLISHER_SORT_FIELDS)[number] | undefined;
  readonly sortOrder: 'asc' | 'desc' | undefined;
  readonly offset: number;
};

/**
 * Lightweight publisher-account directory. These rows are user accounts with isPublisher.
 */
export function AdminPublishersPanel(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: PublisherListSearch = parsePublisherSearch(searchParams);
  const publishersQuery = useAdminPublishersList({
    limit: ADMIN_LIST_PAGE_SIZE,
    offset: listSearch.offset,
    q: listSearch.q,
    sortBy: listSearch.sortBy,
    sortOrder: listSearch.sortOrder,
  });
  const replaceSearch = (nextSearch: PublisherListSearch): void => {
    setSearchParams(buildPublisherSearch(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-6">
      <PublisherFilters
        key={JSON.stringify(listSearch)}
        value={listSearch}
        onApply={(nextSearch) => replaceSearch({ ...nextSearch, offset: 0 })}
        onClear={() => replaceSearch({ q: undefined, sortBy: undefined, sortOrder: undefined, offset: 0 })}
      />
      {renderPublisherBody(publishersQuery, listSearch, replaceSearch)}
    </div>
  );
}

function renderPublisherBody(
  publishersQuery: ReturnType<typeof useAdminPublishersList>,
  listSearch: PublisherListSearch,
  replaceSearch: (nextSearch: PublisherListSearch) => void,
): JSX.Element {
  if (publishersQuery.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (publishersQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(publishersQuery.error)}
        onRetry={() => {
          void publishersQuery.refetch();
        }}
      />
    );
  }
  if (publishersQuery.data.publishers.length === 0) {
    return (
      <EmptyState
        title="No publisher accounts"
        description="This list is user accounts with publisher capability. It is not EPUB creator or EPUB publisher metadata."
      />
    );
  }
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-card">Email</TableHead>
            <TableHead>Display name</TableHead>
            <TableHead>Books</TableHead>
            <TableHead>Catalog visible</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {publishersQuery.data.publishers.map((publisher) => (
            <TableRow key={publisher.id}>
              <TableCell className="sticky left-0 z-10 max-w-56 truncate bg-card font-medium" title={publisher.email}>
                {publisher.email}
              </TableCell>
              <TableCell>{publisher.displayName ?? 'No display name'}</TableCell>
              <TableCell>{publisher.bookCount}</TableCell>
              <TableCell>{publisher.catalogVisibleBookCount}</TableCell>
              <TableCell>{formatWireInstant(publisher.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/publishers/${publisher.id}`}>Summary</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ListPagination
        offset={listSearch.offset}
        limit={ADMIN_LIST_PAGE_SIZE}
        total={publishersQuery.data.total}
        onOffsetChange={(offset: number) => replaceSearch({ ...listSearch, offset })}
      />
    </div>
  );
}

function PublisherFilters({
  value,
  onApply,
  onClear,
}: {
  readonly value: PublisherListSearch;
  readonly onApply: (nextSearch: PublisherListSearch) => void;
  readonly onClear: () => void;
}): JSX.Element {
  const [keyword, setKeyword] = useState<string>(value.q ?? '');
  const [sortBy, setSortBy] = useState<string>(value.sortBy ?? '');
  const [sortOrder, setSortOrder] = useState<string>(value.sortOrder ?? '');
  const [keywordError, setKeywordError] = useState<string | undefined>(undefined);
  return (
    <form
      className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-3"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed: string = keyword.trim();
        if (trimmed.length === 1) {
          setKeywordError('Enter at least 2 characters, or leave keyword empty.');
          return;
        }
        setKeywordError(undefined);
        onApply({
          q: trimmed.length >= 2 ? trimmed : undefined,
          sortBy: PUBLISHER_SORT_FIELDS.find((field) => field === sortBy),
          sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
          offset: 0,
        });
      }}
    >
      <div className="flex flex-col gap-2 md:col-span-3">
        <p className="text-sm text-muted-foreground">
          Publisher accounts only. EPUB author and EPUB publisher names stay on the book record.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="publisher-q">Keyword</Label>
        <Input id="publisher-q" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="publisher-sort">Sort by</Label>
        <Select id="publisher-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="">Default</option>
          {PUBLISHER_SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="publisher-order">Sort order</Label>
        <Select id="publisher-order" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
          <option value="">Default</option>
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </Select>
      </div>
      {keywordError !== undefined ? <p className="text-sm text-destructive">{keywordError}</p> : null}
      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        <Button type="button" variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}

function parsePublisherSearch(searchParams: URLSearchParams): PublisherListSearch {
  const keyword: string = searchParams.get('q')?.trim() ?? '';
  const sortBy: string | null = searchParams.get('sortBy');
  const sortOrder: string | null = searchParams.get('sortOrder');
  return {
    q: keyword.length >= 2 ? keyword : undefined,
    sortBy: PUBLISHER_SORT_FIELDS.find((field) => field === sortBy),
    sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

function buildPublisherSearch(search: PublisherListSearch): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (search.q !== undefined) {
    params.set('q', search.q);
  }
  if (search.sortBy !== undefined) {
    params.set('sortBy', search.sortBy);
  }
  if (search.sortOrder !== undefined) {
    params.set('sortOrder', search.sortOrder);
  }
  if (search.offset > 0) {
    params.set('offset', String(search.offset));
  }
  return params;
}
