import { colors } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { theme } from './theme';
import { typography } from './typography';

describe('Direction B theme tokens', () => {
  it('maps Figma colors to RN tokens with compatibility aliases', () => {
    const expectedCanvas = '#F5F2EC';
    const expectedError = '#B83232';
    const expectedPrimaryHover = '#B5531A';
    expect(colors.canvas).toBe(expectedCanvas);
    expect(colors.canvasWarm).toBe('#EDE6D8');
    expect(colors.surface).toBe('#FFFFFF');
    expect(colors.surfaceAlt).toBe('#F9F6F1');
    expect(colors.primary).toBe('#CF6118');
    expect(colors.primaryHover).toBe(expectedPrimaryHover);
    expect(colors.primaryDim).toBe('#FDF1E6');
    expect(colors.secondary).toBe('#5BA0C8');
    expect(colors.amber).toBe('#F0B820');
    expect(colors.textPrimary).toBe('#243018');
    expect(colors.textSecondary).toBe('#4E6038');
    expect(colors.textMuted).toBe('#7A8A62');
    expect(colors.textFaint).toBe('#B0BC94');
    expect(colors.textOnBrand).toBe('#FFFFFF');
    expect(colors.borderDefault).toBe('#D4CBBA');
    expect(colors.borderSubtle).toBe('#EAE6DC');
    expect(colors.borderFocus).toBe('#CF6118');
    expect(colors.error).toBe(expectedError);
    expect(colors.errorBg).toBe('#FDEAEA');
    expect(colors.success).toBe('#2E7D52');
    expect(colors.successBg).toBe('#E8F5EE');
    expect(colors.warning).toBe('#C47A1E');
    expect(colors.warningBg).toBe('#FEF3E0');
    expect(colors.info).toBe('#2B72B0');
    expect(colors.infoBg).toBe('#E8F0FD');
    expect(colors.locked).toBe('#748A62');
    expect(colors.lockedBg).toBe('#EEF0E8');
    expect(colors.navBg).toBe('#1C4F68');
    expect(colors.background).toBe(expectedCanvas);
    expect(colors.border).toBe(colors.borderDefault);
    expect(colors.danger).toBe(expectedError);
    expect(colors.onPrimary).toBe(colors.textOnBrand);
    expect(colors.primaryMuted).toBe(expectedPrimaryHover);
    expect(colors.textPlaceholder).toBe('#B0BC94');
  });

  it('keeps existing spacing aliases unchanged and adds Direction B scale', () => {
    expect(spacing.xxs).toBe(4);
    expect(spacing.xs).toBe(8);
    expect(spacing.sm).toBe(12);
    expect(spacing.md).toBe(16);
    expect(spacing.lg).toBe(24);
    expect(spacing.xl).toBe(28);
    expect(spacing.xxl).toBe(32);
    expect(spacing.xxxl).toBe(48);
    expect(spacing.screenH).toBe(20);
    expect(spacing.section).toBe(24);
    expect(spacing.cardInner).toBe(16);
    expect(spacing.tabBar).toBe(82);
    expect(spacing.scale.xs).toBe(4);
    expect(spacing.scale.sm).toBe(8);
    expect(spacing.scale.md).toBe(12);
    expect(spacing.scale.lg).toBe(16);
    expect(spacing.scale.xl).toBe(20);
    expect(spacing.scale['2xl']).toBe(24);
    expect(spacing.scale['3xl']).toBe(32);
    expect(spacing.scale['4xl']).toBe(48);
  });

  it('adds Direction B radii without changing control radius', () => {
    expect(radii.xs).toBe(6);
    expect(radii.sm).toBe(10);
    expect(radii.md).toBe(14);
    expect(radii.lg).toBe(18);
    expect(radii.xl).toBe(22);
    expect(radii.xxl).toBe(28);
    expect(radii.full).toBe(9999);
    expect(radii.control).toBe(12);
  });

  it('translates Figma CSS shadows into RN shadow tokens', () => {
    expect(shadows.xs).toEqual({
      shadowColor: '#1C4F68',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
      spread: 0,
    });
    expect(shadows.focus.spread).toBe(3);
    expect(shadows.focus.ringColor).toBe('rgba(207, 97, 24, 0.25)');
    expect(shadows.focus.shadowRadius).toBe(0);
    expect(shadows.focus.elevation).toBe(0);
  });

  it('does not shrink existing screen typography sizes', () => {
    expect(typography.body.fontSize).toBe(18);
    expect(typography.body.lineHeight).toBe(26);
    expect(typography.title.fontSize).toBe(32);
    expect(typography.titleLg.fontSize).toBe(36);
    expect(typography.button.fontSize).toBe(20);
    expect(typography.families.display).toBe('Fraunces_700Bold_Italic');
    expect(typography.families.ui).toBe('Nunito_400Regular');
    expect(typography.families.reading).toBe('Georgia');
  });

  it('exposes the token groups on the shared theme object', () => {
    expect(theme.colors).toBe(colors);
    expect(theme.spacing).toBe(spacing);
    expect(theme.typography).toBe(typography);
    expect(theme.radii).toBe(radii);
    expect(theme.shadows).toBe(shadows);
    expect(theme.controlMinHeight).toBe(56);
  });
});
