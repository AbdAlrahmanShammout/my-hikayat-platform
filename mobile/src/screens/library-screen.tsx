import type { JSX } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme/theme';

/**
 * Library tab placeholder until later Reader features ship.
 */
export function LibraryScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="shell-library-screen">
      <Text style={styles.title} accessibilityRole="header" testID="shell-library-title">
        My books
      </Text>
      <Text style={styles.body}>Your library will appear here after you start reading.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
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
