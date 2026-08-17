import type { JSX } from 'react';
import { Link } from 'react-router';

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

type AdminCollectionsTableProps = {
  readonly collections: ReadonlyArray<components['schemas']['CollectionResponse']>;
};

/**
 * Admin collections table. Item counts come from the collection payload.
 */
export function AdminCollectionsTable({ collections }: AdminCollectionsTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Books</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collections.map((collection) => (
          <TableRow key={collection.id}>
            <TableCell className="font-medium">{collection.title}</TableCell>
            <TableCell>{String(collection.items.length)}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/collections/${collection.id}`}>Open</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
