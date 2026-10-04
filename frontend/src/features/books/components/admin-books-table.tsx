import { Eye } from 'lucide-react';
import type { JSX } from 'react';
import { Link } from 'react-router';

import { BookCoverThumbnail } from '@/components/book-cover-thumbnail';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminBookStatusBadge } from '@/features/books/components/admin-book-status-badge';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import type { components } from '@/generated/admin';
import { hasWireInstant } from '@/lib/has-wire-instant';

type AdminBooksTableProps = {
  readonly books: ReadonlyArray<components['schemas']['BookResponse']>;
  readonly showOwner?: boolean;
};

/**
 * Admin catalog table. Values are displayed as returned by GET /admin/books.
 */
export function AdminBooksTable({ books, showOwner = true }: AdminBooksTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-11" />
          <TableHead className="text-[11px] tracking-wide uppercase">Title</TableHead>
          <TableHead className="text-[11px] tracking-wide uppercase">Status</TableHead>
          <TableHead className="text-[11px] tracking-wide uppercase">Processing</TableHead>
          <TableHead className="text-[11px] tracking-wide uppercase">Layout</TableHead>
          <TableHead className="text-[11px] tracking-wide uppercase">Type</TableHead>
          {showOwner ? <TableHead className="text-[11px] tracking-wide uppercase">Owner</TableHead> : null}
          <TableHead className="text-[11px] tracking-wide uppercase">Categories</TableHead>
          <TableHead className="text-[11px] tracking-wide uppercase">Published</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {books.map((book) => (
          <TableRow key={book.id}>
            <TableCell>
              <BookCoverThumbnail title={book.title} cover={book.cover} size="row" />
            </TableCell>
            <TableCell>
              <span className="block max-w-56 truncate text-[13px] font-medium" title={book.title}>
                {book.title}
              </span>
            </TableCell>
            <TableCell>
              <AdminBookStatusBadge value={book.publishingStatus} />
            </TableCell>
            <TableCell>
              <AdminBookStatusBadge value={book.processingStatus} />
            </TableCell>
            <TableCell className="text-[11px] text-muted-foreground">
              {formatBookEnumLabel(book.layoutType)}
            </TableCell>
            <TableCell className="text-[11px] text-muted-foreground">
              {formatBookEnumLabel(book.bookType)}
            </TableCell>
            {showOwner ? (
              <TableCell>
                <Link
                  className="block max-w-36 truncate text-[11px] text-primary underline"
                  to={`/admin/users/${book.ownerId}`}
                >
                  {formatOwnerHandle(book)}
                </Link>
              </TableCell>
            ) : null}
            <TableCell className="max-w-40 truncate text-[11px] text-muted-foreground">
              {formatCategoryList(book.categories)}
            </TableCell>
            <TableCell className="text-[11px] text-muted-foreground">
              {formatCatalogDate(book.publishedAt)}
            </TableCell>
            <TableCell>
              <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-primary">
                <Link to={`/admin/books/${book.id}`}>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  Open
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatOwnerHandle(book: components['schemas']['BookResponse']): string {
  const email: string | undefined = book.owner?.email;
  if (email !== undefined && email.includes('@')) {
    return email.split('@')[0] ?? email;
  }
  return email ?? String(book.ownerId);
}

function formatCategoryList(
  categories: components['schemas']['BookResponse']['categories'],
): string {
  if (categories.length === 0) {
    return '—';
  }
  return categories.map((category) => category.name).join(', ');
}

function formatCatalogDate(value: unknown): string {
  if (!hasWireInstant(value) || typeof value !== 'string') {
    return 'Not in catalog';
  }
  const parsed: Date = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}
