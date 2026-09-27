import type { JSX } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { PRODUCT_NAME } from '@/config/product-name';

type DashboardBrandProps = {
  readonly subtitle: string;
};

/**
 * Sidebar product mark: logo plus My Hikayat name.
 */
export function DashboardBrand({ subtitle }: DashboardBrandProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <BrandLogo className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0">
        <p className="font-display text-lg leading-tight tracking-tight">{PRODUCT_NAME}</p>
        <p className="text-xs text-sidebar-muted">{subtitle}</p>
      </div>
    </div>
  );
}
