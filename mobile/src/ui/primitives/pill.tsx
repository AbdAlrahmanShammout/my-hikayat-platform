import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';

export type PillVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'locked'
  | 'info'
  | 'neutral';

type PillProps = {
  readonly label: string;
  readonly variant?: PillVariant;
  readonly testID?: string;
};

type PillPalette = {
  readonly background: string;
  readonly text: string;
};

const palettes: Record<PillVariant, PillPalette> = {
  default: { background: theme.colors.canvasWarm, text: theme.colors.textSecondary },
  primary: { background: theme.colors.primaryDim, text: theme.colors.primary },
  secondary: { background: theme.colors.secondaryDim, text: theme.colors.secondary },
  success: { background: theme.colors.successBg, text: theme.colors.success },
  warning: { background: theme.colors.warningBg, text: theme.colors.warning },
  error: { background: theme.colors.errorBg, text: theme.colors.error },
  locked: { background: theme.colors.lockedBg, text: theme.colors.locked },
  info: { background: theme.colors.infoBg, text: theme.colors.info },
  neutral: { background: theme.colors.canvasWarm, text: theme.colors.textMuted },
};

/**
 * Semantic status/category chip. Does not encode entitlement or access rules.
 */
export function Pill({ label, variant = 'default', testID }: PillProps): JSX.Element {
  const palette = palettes[variant];
  return (
    <View style={[styles.chip, { backgroundColor: palette.background }]} testID={testID}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.scale.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.full,
  },
  label: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
  },
});
