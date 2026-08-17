import type { JSX } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminCategoryRenameDialog } from '@/features/categories/components/admin-category-rename-dialog';
import { AdminCategoryWeightForm } from '@/features/categories/components/admin-category-weight-form';
import type { components } from '@/generated/admin';

type AdminCategoriesTableProps = {
  readonly categories: ReadonlyArray<components['schemas']['CategoryResponse']>;
};

/**
 * Admin category table. Weight is inline; rename is a dialog. Delete is not offered.
 */
export function AdminCategoriesTable({ categories }: AdminCategoriesTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>categoryWeight</TableHead>
          <TableHead className="text-right">Actions</TableHead>
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
            <TableCell className="text-right">
              <AdminCategoryRenameDialog category={category} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
