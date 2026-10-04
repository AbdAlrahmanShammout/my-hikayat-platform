import type { JSX } from 'react';

import { getUserFacingErrorMessage } from '@/api/get-user-facing-error-message';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminUserBookEngagement } from '@/features/users/hooks/use-admin-user-book-engagement';
import { formatCompactDurationMs } from '@/lib/format-compact-duration';

type AdminUserBookEngagementDialogProps = {
  readonly userId: number;
  readonly bookId: number;
  readonly bookTitle: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

/**
 * Shows chapter or spread engagement from the user-book endpoint.
 */
export function AdminUserBookEngagementDialog({
  userId,
  bookId,
  bookTitle,
  open,
  onOpenChange,
}: AdminUserBookEngagementDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book engagement</DialogTitle>
          <DialogDescription>
            {`${bookTitle}. Paid time is activeDurationMs. Visual scene time is unpaid and is not added to it.`}
          </DialogDescription>
        </DialogHeader>
        {open ? <EngagementBody userId={userId} bookId={bookId} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function EngagementBody({
  userId,
  bookId,
}: {
  readonly userId: number;
  readonly bookId: number;
}): JSX.Element {
  const engagementQuery = useAdminUserBookEngagement(userId, bookId, true);
  if (engagementQuery.isPending) {
    return <Skeleton className="h-24 w-full" />;
  }
  if (engagementQuery.isError) {
    return (
      <ErrorState
        message={getUserFacingErrorMessage(engagementQuery.error)}
        onRetry={() => {
          void engagementQuery.refetch();
        }}
      />
    );
  }
  const engagement = engagementQuery.data;
  return (
    <div className="space-y-4">
      <p className="text-sm">
        {`Paid active time: ${formatCompactDurationMs(engagement.activeDurationMs)}`}
      </p>
      {engagement.layoutType !== 'fixed_layout' ? (
        <ChapterList chapters={engagement.chapters} />
      ) : null}
      {engagement.layoutType !== 'reflowable' ? (
        <SpreadList spreads={engagement.spreads} />
      ) : null}
    </div>
  );
}

function ChapterList({
  chapters,
}: {
  readonly chapters: ReadonlyArray<{
    readonly spineIndex: number;
    readonly title: string | null;
    readonly activeDurationMs: number;
  }>;
}): JSX.Element {
  if (chapters.length === 0) {
    return (
      <EmptyState
        title="No chapter engagement"
        description="This reflowable book has no chapter engagement rows."
      />
    );
  }
  return (
    <ul className="space-y-3">
      {chapters.map((chapter) => (
        <li key={chapter.spineIndex} className="text-sm">
          <p className="font-medium">{chapter.title ?? `Spine ${String(chapter.spineIndex)}`}</p>
          <p className="text-muted-foreground">
            {`Spine ${String(chapter.spineIndex)} · ${formatCompactDurationMs(chapter.activeDurationMs)}`}
          </p>
        </li>
      ))}
    </ul>
  );
}

function SpreadList({
  spreads,
}: {
  readonly spreads: ReadonlyArray<{
    readonly spreadIndex: number;
    readonly pageNumber: number;
    readonly activeDurationMs: number;
    readonly visualSceneTimeMs: number;
  }>;
}): JSX.Element {
  if (spreads.length === 0) {
    return (
      <EmptyState
        title="No spread engagement"
        description="This fixed-layout book has no spread engagement rows."
      />
    );
  }
  return (
    <ul className="space-y-3">
      {spreads.map((spread) => (
        <li key={`${String(spread.spreadIndex)}-${String(spread.pageNumber)}`} className="text-sm">
          <p className="font-medium">{`Spread ${String(spread.spreadIndex)}, page ${String(spread.pageNumber)}`}</p>
          <p className="text-muted-foreground">
            {`Paid ${formatCompactDurationMs(spread.activeDurationMs)} · unpaid visual scene ${formatCompactDurationMs(spread.visualSceneTimeMs)}`}
          </p>
        </li>
      ))}
    </ul>
  );
}
