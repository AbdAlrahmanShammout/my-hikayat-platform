/**
 * Typography scale for readable kids-friendly UI.
 * Direction B: Fraunces (titles) + Nunito (UI). System fonts if load fails.
 */
export const typography = {
  families: {
    display: 'Fraunces_700Bold_Italic',
    displayRegular: 'Fraunces_400Regular_Italic',
    ui: 'Nunito_400Regular',
    uiSemibold: 'Nunito_600SemiBold',
    uiBold: 'Nunito_700Bold',
    uiExtraBold: 'Nunito_800ExtraBold',
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
    fontFamily: 'Fraunces_700Bold_Italic',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    fontFamily: 'Fraunces_700Bold_Italic',
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Nunito_400Regular',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  button: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: 'Nunito_600SemiBold',
  },
  link: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Nunito_600SemiBold',
  },
  tab: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontFamily: 'Nunito_600SemiBold',
  },
} as const;
