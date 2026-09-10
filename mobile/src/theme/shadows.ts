/**
 * Direction B elevation tokens translated from Figma CSS box-shadows.
 * Figma `shadowColor` is rgb(30, 18, 64) = `#1E1240` except `focus`.
 *
 * CSS `spread` is not a React Native View style. Drop shadows use spread 0.
 * `focus` is a 3px ring (`0 0 0 3px rgba(217, 78, 45, 0.25)`); apply it later
 * with `borderWidth` / `borderColor` using `spread` and `ringColor`, not as a
 * drop shadow.
 */
type ShadowToken = {
  readonly shadowColor: string;
  readonly shadowOffset: {
    readonly width: number;
    readonly height: number;
  };
  readonly shadowOpacity: number;
  readonly shadowRadius: number;
  readonly elevation: number;
  readonly spread: number;
  readonly ringColor?: string;
};

const ink = '#1E1240';

export const shadows = {
  xs: {
    shadowColor: ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    spread: 0,
  },
  sm: {
    shadowColor: ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    spread: 0,
  },
  md: {
    shadowColor: ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    spread: 0,
  },
  lg: {
    shadowColor: ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 8,
    spread: 0,
  },
  xl: {
    shadowColor: ink,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 48,
    elevation: 12,
    spread: 0,
  },
  book: {
    shadowColor: ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 6,
    spread: 0,
  },
  focus: {
    shadowColor: '#D94E2D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 0,
    spread: 3,
    ringColor: 'rgba(217, 78, 45, 0.25)',
  },
} as const satisfies Record<string, ShadowToken>;
