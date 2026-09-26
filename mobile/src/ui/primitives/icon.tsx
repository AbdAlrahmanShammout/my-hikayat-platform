import type { JSX } from 'react';
import type { LucideIcon } from 'lucide-react-native';

import { theme } from '@/theme/theme';

export type IconSize = 'sm' | 'md' | 'lg';

type IconProps = {
  readonly icon: LucideIcon;
  readonly color?: string;
  readonly size?: IconSize | number;
  readonly strokeWidth?: number;
  readonly accessibilityLabel?: string;
};

const SIZE_MAP: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * Consistent Lucide icon sizing and stroke for app chrome and actions.
 */
export function Icon({
  icon: LucideGlyph,
  color = theme.colors.textPrimary,
  size = 'md',
  strokeWidth = 2,
  accessibilityLabel,
}: IconProps): JSX.Element {
  const pixelSize: number = typeof size === 'number' ? size : SIZE_MAP[size];
  return (
    <LucideGlyph
      color={color}
      size={pixelSize}
      strokeWidth={strokeWidth}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel === undefined ? 'no' : 'yes'}
    />
  );
}
