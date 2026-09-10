import type { JSX } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';

/**
 * Branded wait surface while session bootstrap decides where to route.
 * Duration stays network-bound — no artificial delay.
 */
export function SessionSplash(): JSX.Element {
  return (
    <View style={styles.wrap} accessibilityLabel="Loading">
      <Text style={styles.wordmark} accessibilityRole="header">
        My Hikayat
      </Text>
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
  wordmark: {
    ...theme.typography.titleLg,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textOnBrand,
  },
});
