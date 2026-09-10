import type { ViewStyle } from 'react-native';

import { theme } from '@/theme/theme';

type ThemeShadow = (typeof theme.shadows)[keyof typeof theme.shadows];

/**
 * Maps a theme shadow token onto React Native View shadow/elevation styles.
 * Omits Figma-only `spread` and `ringColor`, which are not ViewStyle fields.
 */
export function toViewShadow(shadow: ThemeShadow): ViewStyle {
  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
    elevation: shadow.elevation,
  };
}
