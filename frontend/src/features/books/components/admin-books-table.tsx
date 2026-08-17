import type { JSX } from 'react';
import { Link } from 'react-router';

import { AdminBookStatusBadge } from '@/features/books/components/admin-book-status-badge';
import { formatBookEnumLabel } from '@/features/books/lib/format-book-enum-label';
import { formatBookOwnerLabel } from '@/features/books/lib/format-book-owner-label';
import { joinBookCategoryNames } from '@/features/books/lib/join-book-category-names';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { components } from '@/generated/admin';
import { formatWireInstant } from '@/lib/format-wire-instant';
import { hasWireInstant } from '@/lib/has-wire-instant';

type AdminBooksTableProps = {
  readonly books: ReadonlyArray<components['schemas']['BookResponse']>;
};

/**
 * Admin catalog table. Values are displayed as returned by GET /admin/books.
 */
export function AdminBooksTable({ books }: AdminBooksTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Publishing</TableHead>
          <TableHead>Processing</TableHead>
          <TableHead>Layout</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Categories</TableHead>
          <TableHead>Published</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {books.map((book) => (
          <TableRow key={book.id}>
            <TableCell className="font-medium">{book.title}</TableCell>
            <TableCell>
              <AdminBookStatusBadge value={book.publishingStatus} />
            </TableCell>
            <TableCell>
              <AdminBookStatusBadge value={book.processingStatus} />
            </TableCell>
            <TableCell>{formatBookEnumLabel(book.layoutType)}</TableCell>
            <TableCell>{formatBookEnumLabel(book.bookType)}</TableCell>
            <TableCell>{formatBookOwnerLabel(book)}</TableCell>
            <TableCell>{joinBookCategoryNames(book.categories)}</TableCell>
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
