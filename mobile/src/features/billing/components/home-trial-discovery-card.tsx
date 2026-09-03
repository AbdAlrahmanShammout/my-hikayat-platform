import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { resolveHomeTrialDiscovery } from '@/features/billing/lib/resolve-home-trial-discovery';
import { theme } from '@/theme/theme';

/**
 * Home trial discovery: eligible offer or active remaining time. Never auto-starts trial.
 */
export function HomeTrialDiscoveryCard(): JSX.Element | null {
  const billing = useReaderSubscription();
  if (billing.isLoading) {
    return (
      <View style={styles.card} testID="home-trial-discovery-loading">
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }
  if (billing.isError) {
    return null;
  }
  const discovery = resolveHomeTrialDiscovery(billing.subscription);
  if (discovery.kind === 'hidden') {
    return null;
  }
  return (
    <View
      style={styles.card}
      testID={
        discovery.kind === 'offer' ? 'home-trial-discovery-offer' : 'home-trial-discovery-active'
      }
    >
      <Text style={styles.title}>{discovery.title}</Text>
      <Text style={styles.body}>{discovery.body}</Text>
      {discovery.kind === 'active' && discovery.remainingLabel !== null ? (
        <Text style={styles.remaining} testID="home-trial-discovery-remaining">
          {discovery.remainingLabel}
        </Text>
      ) : null}
      <Pressable
        style={styles.button}
        onPress={() => {
          router.push('/(app)/(tabs)/profile' as Href);
        }}
        accessibilityRole="button"
        accessibilityLabel={discovery.actionLabel}
        testID="home-trial-discovery-action"
      >
        <Text style={styles.buttonLabel}>{discovery.actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  remaining: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primaryMuted,
  },
  button: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  buttonLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
});
