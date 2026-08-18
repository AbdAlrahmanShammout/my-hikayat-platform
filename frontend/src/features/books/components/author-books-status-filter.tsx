import type { JSX } from 'react';

import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  BOOK_PUBLISHING_STATUS_FILTERS,
  type BookPublishingStatusFilter,
} from '@/features/books/lib/book-publishing-status-filters';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';

type AuthorBooksStatusFilterProps = {
  readonly value: BookPublishingStatusFilter | undefined;
  readonly onChange: (value: BookPublishingStatusFilter | undefined) => void;
};

/**
 * Optional publishingStatus query for GET /author/books.
 */
export function AuthorBooksStatusFilter({
  value,
  onChange,
}: AuthorBooksStatusFilterProps): JSX.Element {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor="author-publishing-status-filter">Publishing status</Label>
      <Select
        id="author-publishing-status-filter"
        value={value ?? ''}
        onChange={(event) => {
          const nextValue: string = event.target.value;
          onChange(nextValue === '' ? undefined : (nextValue as BookPublishingStatusFilter));
        }}
      >
        <option value="">All statuses</option>
        {BOOK_PUBLISHING_STATUS_FILTERS.map((status) => (
          <option key={status} value={status}>
            {formatBookEnumLabel(status)}
          </option>
        ))}
      </Select>
    </div>
  );
}
