/**
 * Typography scale for readable kids-friendly UI.
 * Direction B families (Fraunces / Nunito) are recorded but not loaded or
 * applied in this slice. Existing variant sizes stay unchanged.
 */
export const typography = {
  families: {
    display: 'System',
    ui: 'System',
    reading: 'Georgia',
  },
  plannedFamilies: {
    display: 'Fraunces',
    ui: 'Nunito',
    reading: 'Georgia',
  },
  scale: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 38,
    '5xl': 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.6,
    relaxed: 1.75,
    loose: 2.0,
  },
  titleLg: {
    fontSize: 36,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
  },
  label: {
    fontSize: 14,
  },
  button: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  link: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  tab: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
} as const;
