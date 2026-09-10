/**
 * Spacing tokens. Existing xxs–xxxl keys keep their current values so screens
 * do not reflow in this slice. Direction B names live under `scale` plus the
 * semantic keys from Figma `spacing`.
 */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 48,
  screenH: 20,
  section: 24,
  cardInner: 16,
  tabBar: 82,
  scale: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  },
} as const;
