import type { JSX } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminCategoryWeightForm } from '@/features/categories/components/admin-category-weight-form';
import type { components } from '@/generated/admin';

type AdminCategoriesTableProps = {
  readonly categories: ReadonlyArray<components['schemas']['CategoryResponse']>;
};

/**
 * Admin category table. Name and slug are read-only; only categoryWeight is editable.
 */
export function AdminCategoriesTable({ categories }: AdminCategoriesTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>categoryWeight</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>{category.slug}</TableCell>
            <TableCell>
              <AdminCategoryWeightForm category={category} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
