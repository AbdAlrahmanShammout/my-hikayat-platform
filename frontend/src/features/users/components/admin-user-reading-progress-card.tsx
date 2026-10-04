import type { JSX } from 'react';
import { useState } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { BookCoverThumbnail } from '@/components/book-cover-thumbnail';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListPagination } from '@/components/list-pagination';
import { ProgressBar } from '@/components/progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_LIST_PAGE_SIZE } from '@/config/admin-list-page-size';
import { AdminUserBookEngagementDialog } from '@/features/users/components/admin-user-book-engagement-dialog';
import { useAdminUserReadingProgress } from '@/features/users/hooks/use-admin-user-reading-progress';
import type { components } from '@/generated/admin';
import { formatCompactDurationMs } from '@/lib/format-compact-duration';
import { formatRelativeInstant } from '@/lib/format-relative-instant';

type ReadingItem = components['schemas']['AdminUserReadingProgressItemResponse'];

type AdminUserReadingProgressCardProps = {
  readonly userId: number;
  readonly initialItems: readonly ReadingItem[];
  readonly total: number;
};

/**
 * Displays saved reading progress. The first page comes from user detail.
 * Later pages use GET /admin/users/:userId/reading-progress.
 */
export function AdminUserReadingProgressCard({
  userId,
  initialItems,
  total,
}: AdminUserReadingProgressCardProps): JSX.Element {
  const [offset, setOffset] = useState<number>(0);
  const laterPageQuery = useAdminUserReadingProgress(
    userId,
    { limit: ADMIN_LIST_PAGE_SIZE, offset },
    offset > 0,
  );
  const items: readonly ReadingItem[] =
    offset === 0 ? initialItems : (laterPageQuery.data?.readingProgress ?? []);
  const pageTotal: number = offset === 0 ? total : (laterPageQuery.data?.total ?? total);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading progress</CardTitle>
        <CardDescription>
          {`${String(pageTotal)} books with saved progress. Reflowable position is spine and scroll. Fixed-layout position is spread and page.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderProgressBody(laterPageQuery, offset, items, userId)}
        {pageTotal > ADMIN_LIST_PAGE_SIZE ? (
          <ListPagination
            offset={offset}
            limit={ADMIN_LIST_PAGE_SIZE}
            total={pageTotal}
            onOffsetChange={setOffset}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function renderProgressBody(
  laterPageQuery: ReturnType<typeof useAdminUserReadingProgress>,
  offset: number,
  items: readonly ReadingItem[],
  userId: number,
): JSX.Element {
  if (offset > 0 && laterPageQuery.isPending) {
    return <Skeleton className="h-24 w-full" />;
  }
  if (offset > 0 && laterPageQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(laterPageQuery.error)}
        onRetry={() => {
          void laterPageQuery.refetch();
        }}
      />
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="No reading activity"
        description="This user has no saved reading progress yet."
      />
    );
  }
  return (
    <ul className="space-y-6">
      {items.map((item) => (
        <li key={item.book.id}>
          <ReadingProgressRow userId={userId} item={item} />
        </li>
      ))}
    </ul>
  );
}

function ReadingProgressRow({
  userId,
  item,
}: {
  readonly userId: number;
  readonly item: ReadingItem;
}): JSX.Element {
  const [isEngagementOpen, setIsEngagementOpen] = useState<boolean>(false);
  const authorLabel: string | null = formatOptionalText(item.book.authorName);
  return (
    <div className="flex gap-4">
      <BookCoverThumbnail title={item.book.title} cover={item.book.cover} size="sm" />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="font-medium">{item.book.title}</p>
          {authorLabel !== null ? (
            <p className="text-sm text-muted-foreground">{`EPUB creator: ${authorLabel}`}</p>
          ) : null}
        </div>
        <ProgressBar value={item.contentProgressPercent} label={`${item.book.title} progress`} />
        <PositionLine item={item} />
        {item.activeDurationMs > 0 ? (
          <p className="text-sm text-muted-foreground">
            {`${formatCompactDurationMs(item.activeDurationMs)} active reading`}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {`Last read: ${formatRelativeInstant(item.lastSessionAt)}`}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsEngagementOpen(true)}>
          View engagement
        </Button>
        <AdminUserBookEngagementDialog
          userId={userId}
          bookId={item.book.id}
          bookTitle={item.book.title}
          open={isEngagementOpen}
          onOpenChange={setIsEngagementOpen}
        />
      </div>
    </div>
  );
}

function PositionLine({ item }: { readonly item: ReadingItem }): JSX.Element {
  if (item.layoutType === 'fixed_layout') {
    return (
      <p className="text-sm">
        {`Spread ${formatIndex(item.spreadIndex)}, page ${formatIndex(item.pageNumber)}`}
      </p>
    );
  }
  return (
    <p className="text-sm">
      {`Spine ${formatIndex(item.spineIndex)}, scroll ${formatIndex(item.scrollOffset)}`}
    </p>
  );
}

function formatIndex(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return 'not set';
}

function formatOptionalText(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value.trim() === '') {
    return null;
  }
  return value;
}
