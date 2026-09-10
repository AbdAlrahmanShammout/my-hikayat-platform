/**
 * Semantic color tokens — Direction B (Warm / Playful Story World).
 * Hex values match Figma Make `src/ds/tokens.ts`. Existing names stay as aliases.
 */
const canvas = '#FDF6EC';
const canvasWarm = '#F7EDDA';
const surface = '#FFFFFF';
const surfaceAlt = '#FEF9F4';
const surfaceRaised = '#FFFFFF';
const primary = '#D94E2D';
const primaryHover = '#BF3E1E';
const primaryDim = '#FCE8E3';
const secondary = '#7B5CC2';
const secondaryDim = '#EDE8F8';
const amber = '#E8922A';
const amberDim = '#FEF3E0';
const textPrimary = '#1E1240';
const textSecondary = '#584870';
const textMuted = '#8E7FA6';
const textFaint = '#C4B8D8';
const textOnBrand = '#FFFFFF';
const textOnDark = '#EDE8F8';
const borderDefault = '#E6D4BC';
const borderSubtle = '#F2E8DB';
const borderStrong = '#D0B898';
const borderFocus = '#D94E2D';
const success = '#2E7D52';
const successBg = '#E8F5EE';
const warning = '#C47A1E';
const warningBg = '#FEF3E0';
const error = '#B83232';
const errorBg = '#FDEAEA';
const info = '#2B72B0';
const infoBg = '#E8F0FD';
const locked = '#6B6880';
const lockedBg = '#EEEDF4';
const navBg = '#1E1240';
const navText = '#EDE8F8';
const navMuted = '#8E7FA6';
const navActive = '#D94E2D';
const navActiveBg = 'rgba(217, 78, 45, 0.12)';

export const colors = {
  canvas,
  canvasWarm,
  surface,
  surfaceAlt,
  surfaceRaised,
  primary,
  primaryHover,
  primaryDim,
  secondary,
  secondaryDim,
  amber,
  amberDim,
  textPrimary,
  textSecondary,
  textMuted,
  textFaint,
  textOnBrand,
  textOnDark,
  borderDefault,
  borderSubtle,
  borderStrong,
  borderFocus,
  success,
  successBg,
  warning,
  warningBg,
  error,
  errorBg,
  info,
  infoBg,
  locked,
  lockedBg,
  navBg,
  navText,
  navMuted,
  navActive,
  navActiveBg,
  /** Compatibility alias → canvas */
  background: canvas,
  /** Compatibility alias → borderDefault */
  border: borderDefault,
  /** Compatibility alias → error */
  danger: error,
  /** Compatibility alias → textOnBrand */
  onPrimary: textOnBrand,
  /** Compatibility alias → primaryHover */
  primaryMuted: primaryHover,
  /**
   * Existing placeholder token. Not present in Figma `color`; keep the prior hex
   * so current TextInput placeholders do not change in this slice.
   */
  textPlaceholder: '#829AB1',
} as const;
