import type { JSX } from 'react';

import { BookCoverThumbnail } from '@/components/book-cover-thumbnail';
import { EmptyState } from '@/components/empty-state';
import { ProgressBar } from '@/components/progress-bar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { components } from '@/generated/admin';
import { formatCompactDurationMs } from '@/lib/format-compact-duration';
import { formatRelativeInstant } from '@/lib/format-relative-instant';

type AdminUserReadingProgressCardProps = {
  readonly items: Array<components['schemas']['AdminUserReadingProgressItemResponse']>;
};

/**
 * Displays saved reading progress from GET /admin/users/:id, most recently read first.
 */
export function AdminUserReadingProgressCard({
  items,
}: AdminUserReadingProgressCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Progress</CardTitle>
        <CardDescription>
          Books with saved progress. Percent comes from the API; reflowable progress is
          content-based.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="No reading activity"
            description="This user has no saved reading progress yet."
          />
        ) : (
          <ul className="space-y-6">
            {items.map((item) => (
              <li key={`${String(item.book.id)}-${String(item.lastSessionAt)}`}>
                <ReadingProgressRow item={item} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ReadingProgressRow({
  item,
}: {
  readonly item: components['schemas']['AdminUserReadingProgressItemResponse'];
}): JSX.Element {
  const authorLabel: string | null = formatOptionalText(item.book.authorName);
  const locationLabel: string | null = formatOptionalText(item.locationLabel);
  return (
    <div className="flex gap-4">
      <BookCoverThumbnail title={item.book.title} cover={item.book.cover} size="sm" />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="font-medium">{item.book.title}</p>
          {authorLabel !== null ? (
            <p className="text-sm text-muted-foreground">{authorLabel}</p>
          ) : null}
        </div>
        <ProgressBar value={item.contentProgressPercent} label={`${item.book.title} progress`} />
        {locationLabel !== null ? <p className="text-sm">{locationLabel}</p> : null}
        {item.activeDurationMs > 0 ? (
          <p className="text-sm text-muted-foreground">
            {`${formatCompactDurationMs(item.activeDurationMs)} active reading`}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {`Last read: ${formatRelativeInstant(item.lastSessionAt)}`}
        </p>
      </div>
    </div>
  );
}

function formatOptionalText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed: string = value.trim();
  return trimmed === '' ? null : trimmed;
}
