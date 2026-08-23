import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

/**
 * Signed-in home tab. Catalog content arrives in a later STEP.
 */
export function HomeScreen(): JSX.Element {
  const { user } = useSession();
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Home
      </Text>
      <Text style={styles.body}>
        Hello{user !== null ? `, ${user.email}` : ''}. Books for you will show up here soon.
      </Text>
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
