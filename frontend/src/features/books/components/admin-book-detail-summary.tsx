import type { JSX } from 'react';

import { AdminBookStatusBadge } from '@/features/books/components/admin-book-status-badge';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import { formatBookOwnerLabel } from '@/features/books/lib/format-book-owner-label';
import { joinBookCategoryNames } from '@/features/books/lib/join-book-category-names';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

type AdminBookDetailSummaryProps = {
  readonly book: components['schemas']['BookResponse'];
};

/**
 * Read-only book fields from GET /admin/books/:id.
 */
export function AdminBookDetailSummary({ book }: AdminBookDetailSummaryProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catalog record</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <SummaryItem label="Publishing status">
            <AdminBookStatusBadge value={book.publishingStatus} />
          </SummaryItem>
          <SummaryItem label="Processing status">
            <AdminBookStatusBadge value={book.processingStatus} />
          </SummaryItem>
          <SummaryItem label="Layout">{formatBookEnumLabel(book.layoutType)}</SummaryItem>
          <SummaryItem label="Type">{formatBookEnumLabel(book.bookType)}</SummaryItem>
          <SummaryItem label="Owner">{formatBookOwnerLabel(book)}</SummaryItem>
          <SummaryItem label="Categories">{joinBookCategoryNames(book.categories)}</SummaryItem>
          <SummaryItem label="Published at">
            {hasWireInstant(book.publishedAt)
              ? formatWireInstant(book.publishedAt)
              : 'Not in catalog'}
          </SummaryItem>
          <SummaryItem label="Book id">{String(book.id)}</SummaryItem>
        </dl>
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  children,
}: {
  readonly label: string;
  readonly children: JSX.Element | string;
}): JSX.Element {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
