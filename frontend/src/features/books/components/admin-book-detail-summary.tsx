import type { JSX } from 'react';
import { Link } from 'react-router';

import { BookCoverThumbnail } from '@/components/book-cover-thumbnail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminBookStatusBadge } from '@/features/books/components/admin-book-status-badge';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import { formatBookOwnerLabel } from '@/features/books/lib/format-book-owner-label';
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
    <Card className="overflow-hidden rounded-[10px] border-border/70 shadow-xs">
      <CardContent className="p-4">
        <BookCoverThumbnail title={book.title} cover={book.cover} size="detail" />
      </CardContent>
      <CardHeader className="px-4 pb-2 pt-0">
        <CardTitle className="font-sans text-sm font-bold">Catalog Record</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <dl>
          <DefinitionRow label="Book ID" value={`#${book.id}`} isMono />
          <DefinitionRow
            label="Status"
            value={<AdminBookStatusBadge value={book.publishingStatus} />}
          />
          <DefinitionRow
            label="Processing"
            value={<AdminBookStatusBadge value={book.processingStatus} />}
          />
          <DefinitionRow label="Layout" value={formatBookEnumLabel(book.layoutType)} />
          <DefinitionRow label="Book type" value={formatBookEnumLabel(book.bookType)} />
          <DefinitionRow
            label="Owner"
            value={
              <Link
                to={`/admin/users/${book.ownerId}`}
                className="text-primary underline decoration-primary/30 underline-offset-2"
              >
                {formatBookOwnerLabel(book)}
              </Link>
            }
          />
          <DefinitionRow label="EPUB author" value={book.authorName ?? 'Not stored'} />
          <DefinitionRow label="EPUB publisher" value={book.publisherName ?? 'Not stored'} />
          <DefinitionRow
            label="Published"
            value={hasWireInstant(book.publishedAt) ? formatWireInstant(book.publishedAt) : 'Not in catalog'}
          />
        </dl>
        <div className="my-4 h-px bg-border/60" />
        <p className="text-xs leading-5 text-muted-foreground">
          Owner is the managed publisher account. EPUB author and publisher are source metadata
          strings and are not editable here. Layout type is detected during processing.
        </p>
      </CardContent>
    </Card>
  );
}

function DefinitionRow({
  label,
  value,
  isMono = false,
}: {
  readonly label: string;
  readonly value: JSX.Element | string;
  readonly isMono?: boolean;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={
          isMono
            ? 'text-right font-mono text-xs text-foreground'
            : 'break-words text-right text-xs font-medium text-secondary-foreground'
        }
      >
        {value}
      </dd>
    </div>
  );
}
