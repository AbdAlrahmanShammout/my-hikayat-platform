import { colors } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

/**
 * Shared theme tokens. Prefer these over literal colors in features/screens.
 */
export const theme = {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  controlMinHeight: 56,
} as const;
