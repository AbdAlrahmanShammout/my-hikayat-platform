import type { JSX } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { AdminCategoriesPanel } from '@/features/categories/components/admin-categories-panel';

/**
 * Admin category weights. PATCH categoryWeight only; no create, rename, or delete.
 */
export function AdminCategoriesPage(): JSX.Element {
  return (
    <>
      <PageHeader
        title="Categories"
        description="Adjust categoryWeight. Create, rename, and delete are not available."
      />
      <AdminCategoriesPanel />
    </>
  );
}
