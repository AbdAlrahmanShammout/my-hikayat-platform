import type { JSX, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme/theme';

type BackHeaderProps = {
  readonly title: string;
  readonly onPressBack: () => void;
  readonly subtitle?: string;
  readonly rightAction?: ReactNode;
  readonly isDark?: boolean;
  readonly includeSafeArea?: boolean;
  readonly backLabel?: string;
  readonly testID?: string;
  readonly backTestID?: string;
  readonly titleTestID?: string;
};

/**
 * Pushed-screen header. The parent supplies back behavior
 * (`canGoBack() ? back() : replace(fallback)`).
 */
export function BackHeader({
  title,
  onPressBack,
  subtitle,
  rightAction,
  isDark = false,
  includeSafeArea = false,
  backLabel = 'Back',
  testID,
  backTestID,
  titleTestID,
}: BackHeaderProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const foreground = isDark ? theme.colors.textOnDark : theme.colors.textPrimary;
  return (
    <View
      style={[styles.bar, includeSafeArea ? { paddingTop: insets.top + theme.spacing.xs } : null]}
      testID={testID}
    >
      <Pressable
        onPress={onPressBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        testID={backTestID}
        style={styles.back}
      >
        <Text style={[styles.chevron, { color: foreground }]}>‹</Text>
        <Text style={[styles.backLabel, { color: foreground }]}>{backLabel}</Text>
      </Pressable>
      <View style={styles.titles} pointerEvents="none">
        {title.length > 0 ? (
          <Text
            style={[styles.title, { color: foreground }]}
            numberOfLines={1}
            accessibilityRole="header"
            testID={titleTestID}
          >
            {title}
          </Text>
        ) : null}
        {subtitle !== undefined ? (
          <Text style={[styles.subtitle, { color: foreground }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: theme.controlMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  back: {
    minHeight: theme.controlMinHeight,
    minWidth: theme.controlMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  chevron: {
    fontSize: theme.typography.scale.xl,
    lineHeight: theme.controlMinHeight,
  },
  backLabel: {
    ...theme.typography.body,
  },
  titles: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  title: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.label,
    opacity: 0.8,
    textAlign: 'center',
  },
  right: {
    minWidth: theme.controlMinHeight,
    minHeight: theme.controlMinHeight,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 'auto',
    zIndex: 1,
  },
});
