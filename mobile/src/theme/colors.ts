/**
 * Semantic color tokens — Direction B, derived from the official My Hikayat logo.
 * Hex values match Figma Make `src/ds/tokens.ts`. Existing names stay as aliases.
 */
const canvas = '#F5F2EC';
const canvasWarm = '#EDE6D8';
const surface = '#FFFFFF';
const surfaceAlt = '#F9F6F1';
const surfaceRaised = '#FFFFFF';
const primary = '#CF6118';
const primaryHover = '#B5531A';
const primaryDim = '#FDF1E6';
const secondary = '#5BA0C8';
const secondaryDim = '#E8F3FA';
const amber = '#F0B820';
const amberDim = '#FEF6DC';
const textPrimary = '#243018';
const textSecondary = '#4E6038';
const textMuted = '#7A8A62';
const textFaint = '#B0BC94';
const textOnBrand = '#FFFFFF';
const textOnDark = '#F5F2EC';
const borderDefault = '#D4CBBA';
const borderSubtle = '#EAE6DC';
const borderStrong = '#C4B9A4';
const borderFocus = '#CF6118';
const success = '#2E7D52';
const successBg = '#E8F5EE';
const warning = '#C47A1E';
const warningBg = '#FEF3E0';
const error = '#B83232';
const errorBg = '#FDEAEA';
const info = '#2B72B0';
const infoBg = '#E8F0FD';
const locked = '#748A62';
const lockedBg = '#EEF0E8';
const navBg = '#1C4F68';
const navText = '#F5F2EC';
const navMuted = '#7AB0C4';
const navActive = '#CF6118';
const navActiveBg = 'rgba(207, 97, 24, 0.12)';

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
  /** Placeholder copy uses the faint sage text token. */
  textPlaceholder: textFaint,
} as const;
