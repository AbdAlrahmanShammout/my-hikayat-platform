import type { JSX } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '@/theme/theme';
import { BrandLogo } from '@/ui/primitives/brand-logo';

/**
 * Branded wait surface while session bootstrap decides where to route.
 * Duration stays network-bound — no artificial delay.
 */
export function SessionSplash(): JSX.Element {
  return (
    <View style={styles.wrap} accessibilityLabel="Loading">
      <BrandLogo variant="icon" size={72} testID="session-splash-logo" />
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: theme.colors.navBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
});
