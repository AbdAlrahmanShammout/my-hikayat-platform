import { ChevronLeft } from 'lucide-react-native';
import type { JSX, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme/theme';
import { BrandLogo } from '@/ui/primitives/brand-logo';
import { Icon } from '@/ui/primitives/icon';

type AppToolbarTone = 'light' | 'brand';

type AppToolbarProps = {
  readonly title?: string;
  readonly subtitle?: string;
  readonly showLogo?: boolean;
  readonly logoVariant?: 'lockup' | 'icon';
  readonly onPressBack?: () => void;
  readonly backLabel?: string;
  readonly rightAction?: ReactNode;
  readonly tone?: AppToolbarTone;
  readonly includeSafeArea?: boolean;
  readonly testID?: string;
  readonly backTestID?: string;
  readonly titleTestID?: string;
};

/**
 * Branded app toolbar: optional logo, title, back, and right actions.
 */
export function AppToolbar({
  title,
  subtitle,
  showLogo = false,
  logoVariant = 'icon',
  onPressBack,
  backLabel = 'Back',
  rightAction,
  tone = 'light',
  includeSafeArea = false,
  testID,
  backTestID,
  titleTestID,
}: AppToolbarProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const isBrand: boolean = tone === 'brand';
  const foreground: string = isBrand ? theme.colors.textOnDark : theme.colors.textPrimary;
  const muted: string = isBrand ? theme.colors.navMuted : theme.colors.textMuted;
  return (
    <View
      style={[
        styles.bar,
        isBrand ? styles.barBrand : styles.barLight,
        includeSafeArea ? { paddingTop: insets.top + theme.spacing.xs } : null,
      ]}
      testID={testID}
    >
      <View style={styles.leading}>
        {onPressBack !== undefined ? (
          <Pressable
            onPress={onPressBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            testID={backTestID}
            style={styles.back}
            hitSlop={8}
          >
            <Icon icon={ChevronLeft} color={foreground} size="lg" />
            <Text style={[styles.backLabel, { color: foreground }]}>{backLabel}</Text>
          </Pressable>
        ) : showLogo ? (
          <BrandLogo
            variant={logoVariant}
            size={logoVariant === 'lockup' ? 40 : 32}
            testID={testID !== undefined ? `${testID}-logo` : undefined}
          />
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
      <View style={styles.titles} pointerEvents="none">
        {showLogo && onPressBack !== undefined && (title === undefined || title.length === 0) ? (
          <BrandLogo
            variant={logoVariant}
            size={logoVariant === 'lockup' ? 40 : 28}
            testID={testID !== undefined ? `${testID}-logo` : undefined}
          />
        ) : null}
        {title !== undefined && title.length > 0 ? (
          <Text
            style={[styles.title, { color: foreground }]}
            numberOfLines={1}
            accessibilityRole="header"
            testID={titleTestID}
          >
            {title}
          </Text>
        ) : null}
        {subtitle !== undefined && subtitle.length > 0 ? (
          <Text style={[styles.subtitle, { color: muted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.trailing}>{rightAction ?? <View style={styles.spacer} />}</View>
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
    gap: theme.spacing.xs,
  },
  barLight: {
    backgroundColor: theme.colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  barBrand: {
    backgroundColor: theme.colors.navBg,
  },
  leading: {
    minWidth: theme.controlMinHeight,
    minHeight: theme.controlMinHeight,
    justifyContent: 'center',
    zIndex: 1,
  },
  back: {
    minHeight: theme.controlMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.scale.xs,
  },
  backLabel: {
    ...theme.typography.body,
  },
  titles: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.label,
    textAlign: 'center',
  },
  trailing: {
    minWidth: theme.controlMinHeight,
    minHeight: theme.controlMinHeight,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
  },
  spacer: {
    width: theme.controlMinHeight,
    height: theme.controlMinHeight,
  },
});
