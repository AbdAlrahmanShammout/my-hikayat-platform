import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

/**
 * Shared theme tokens. Prefer these over literal colors in features/screens.
 */
export const theme = {
  colors,
  spacing,
  typography,
  radii: {
    control: 12,
  },
  controlMinHeight: 56,
} as const;
