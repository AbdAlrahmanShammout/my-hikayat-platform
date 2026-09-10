/**
 * Corner radii from Figma Direction B (`radius` in `src/ds/tokens.ts`, px → number).
 * `control` is the existing compatibility radius used by current screens.
 */
export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 9999,
  control: 12,
} as const;
