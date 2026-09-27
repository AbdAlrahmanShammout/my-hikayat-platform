import type { JSX } from 'react';

import hikayatIcon from '@/assets/hikayat-icon.png';
import hikayatLogo from '@/assets/hikayat-logo.png';
import { PRODUCT_NAME } from '@/config/product-name';
import { cn } from '@/lib/cn';

type BrandLogoProps = {
  readonly variant?: 'icon' | 'lockup';
  readonly className?: string;
};

/**
 * Official My Hikayat mark. Use the icon on dark chrome; lockup on light auth surfaces.
 */
export function BrandLogo({ variant = 'icon', className }: BrandLogoProps): JSX.Element {
  const src: string = variant === 'lockup' ? hikayatLogo : hikayatIcon;
  return <img src={src} alt={PRODUCT_NAME} className={cn('object-contain', className)} />;
}
