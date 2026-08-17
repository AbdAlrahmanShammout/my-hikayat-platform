import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminCategoriesPanel } from '@/features/categories/components/admin-categories-panel';

/**
 * Admin categories. Create, rename, and categoryWeight edit; no delete.
 */
export function AdminCategoriesPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Categories"
        description="Create and rename categories, and adjust categoryWeight. Delete is not available."
      />
      <AdminCategoriesPanel />
    </>
  );
}
