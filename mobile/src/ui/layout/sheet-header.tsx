import type { JSX, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';

type SheetHeaderTone = 'danger' | 'warning' | 'neutral';

type SheetHeaderProps = {
  readonly title: string;
  readonly icon?: ReactNode;
  readonly tone?: SheetHeaderTone;
};

/**
 * Figma sheet chrome: optional icon well plus italic display title.
 */
export function SheetHeader({ title, icon, tone = 'neutral' }: SheetHeaderProps): JSX.Element {
  return (
    <View style={styles.root}>
      {icon !== undefined ? (
        <View
          style={[styles.iconWell, { backgroundColor: resolveIconBackground(tone) }]}
          accessibilityElementsHidden
        >
          {icon}
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

function resolveIconBackground(tone: SheetHeaderTone): string {
  if (tone === 'danger') {
    return theme.colors.errorBg;
  }
  if (tone === 'warning') {
    return theme.colors.warningBg;
  }
  return theme.colors.canvasWarm;
}

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.sm,
  },
  iconWell: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    lineHeight: 26,
  },
});
