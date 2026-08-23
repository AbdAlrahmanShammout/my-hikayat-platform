import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';

/**
 * Library tab placeholder until catalog / entitlement lists ship.
 */
export function LibraryScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        My books
      </Text>
      <Text style={styles.body}>Your library will appear here after you start reading.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
