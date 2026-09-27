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
import { BookCategoryChips } from '@/features/books/components/book-category-chips';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import { formatBookOwnerLabel } from '@/features/books/lib/format-book-owner-label';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';
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
          <TableHead>Title</TableHead>
          <TableHead>Publishing</TableHead>
          <TableHead>Processing</TableHead>
          <TableHead>Layout</TableHead>
          <TableHead>Type</TableHead>
          {showOwner ? <TableHead>Owner</TableHead> : null}
          <TableHead>Categories</TableHead>
          <TableHead>Published</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {books.map((book) => (
          <TableRow key={book.id}>
            <TableCell>
              <div className="flex items-center gap-4">
                <BookCoverThumbnail title={book.title} cover={book.cover} />
                <span className="font-medium">{book.title}</span>
              </div>
            </TableCell>
            <TableCell>
              <AdminBookStatusBadge value={book.publishingStatus} />
            </TableCell>
            <TableCell>
              <AdminBookStatusBadge value={book.processingStatus} />
            </TableCell>
            <TableCell>{formatBookEnumLabel(book.layoutType)}</TableCell>
            <TableCell>{formatBookEnumLabel(book.bookType)}</TableCell>
            {showOwner ? (
              <TableCell>
                <Link
                  className="underline-offset-4 hover:underline"
                  to={`/admin/users/${book.ownerId}`}
                >
                  {formatBookOwnerLabel(book)}
                </Link>
              </TableCell>
            ) : null}
            <TableCell>
              <BookCategoryChips categories={book.categories} />
            </TableCell>
            <TableCell>
              {hasWireInstant(book.publishedAt) ? formatWireInstant(book.publishedAt) : 'Not in catalog'}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/books/${book.id}`}>Open</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
