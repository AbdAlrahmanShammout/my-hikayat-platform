import type { JSX } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { PRODUCT_NAME } from '@/config/product-name';

/**
 * Centered product mark for public auth screens.
 */
export function AuthBrand(): JSX.Element {
  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <BrandLogo className="h-16 w-16 rounded-2xl shadow-sm" />
      <p className="font-display text-2xl font-semibold tracking-tight">{PRODUCT_NAME}</p>
    </div>
  );
}
