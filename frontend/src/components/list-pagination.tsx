import type { JSX } from 'react';

import { Button } from '@/components/ui/button';

type ListPaginationProps = {
  readonly offset: number;
  readonly limit: number;
  readonly total: number;
  readonly onOffsetChange: (offset: number) => void;
};

/**
 * Server-side limit/offset pager. Does not sort or filter locally.
 */
export function ListPagination({
  offset,
  limit,
  total,
  onOffsetChange,
}: ListPaginationProps): JSX.Element | null {
  if (total === 0) {
    return null;
  }
  const rangeStart: number = offset + 1;
  const rangeEnd: number = Math.min(offset + limit, total);
  const canGoPrevious: boolean = offset > 0;
  const canGoNext: boolean = offset + limit < total;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {rangeStart}–{rangeEnd} of {total}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => {
            onOffsetChange(Math.max(0, offset - limit));
          }}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => {
            onOffsetChange(offset + limit);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
