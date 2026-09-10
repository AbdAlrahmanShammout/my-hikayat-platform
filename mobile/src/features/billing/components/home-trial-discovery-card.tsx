import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { resolveHomeTrialDiscovery } from '@/features/billing/lib/resolve-home-trial-discovery';
import { theme } from '@/theme/theme';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Home trial discovery: eligible offer or active remaining time. Never auto-starts trial.
 */
export function HomeTrialDiscoveryCard(): JSX.Element | null {
  const billing = useReaderSubscription();
  if (billing.isLoading) {
    return (
      <View style={styles.loading} testID="home-trial-discovery-loading">
        <Skeleton height={72} width="100%" radius={theme.radii.xl} />
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
  if (discovery.kind === 'active') {
    return (
      <View style={styles.activeCard} testID="home-trial-discovery-active">
        <Text style={styles.activeTitle}>{discovery.title}</Text>
        <Text style={styles.activeBody}>{discovery.body}</Text>
        {discovery.remainingLabel !== null ? (
          <Text style={styles.activeRemaining} testID="home-trial-discovery-remaining">
            {discovery.remainingLabel}
          </Text>
        ) : null}
        <Button
          label={discovery.actionLabel}
          variant="secondary"
          onPress={() => {
            router.push('/(app)/(tabs)/profile' as Href);
          }}
          accessibilityLabel={discovery.actionLabel}
          testID="home-trial-discovery-action"
        />
      </View>
    );
  }
  return (
    <View style={styles.offerCard} testID="home-trial-discovery-offer">
      <Text style={styles.offerTitle}>{discovery.title}</Text>
      <Text style={styles.offerBody}>{discovery.body}</Text>
      <Pressable
        style={styles.offerButton}
        onPress={() => {
          router.push('/(app)/(tabs)/profile' as Href);
        }}
        accessibilityRole="button"
        accessibilityLabel={discovery.actionLabel}
        testID="home-trial-discovery-action"
      >
        <Text style={styles.offerButtonLabel}>{discovery.actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginBottom: theme.spacing.xs,
  },
  offerCard: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  offerTitle: {
    ...theme.typography.button,
    color: theme.colors.textOnBrand,
  },
  offerBody: {
    ...theme.typography.body,
    color: theme.colors.textOnBrand,
  },
  offerButton: {
    minHeight: 44,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  offerButtonLabel: {
    ...theme.typography.button,
    fontSize: theme.typography.scale.lg,
    color: theme.colors.primary,
  },
  activeCard: {
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.successBg,
    borderWidth: 1,
    borderColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  activeTitle: {
    ...theme.typography.button,
    fontSize: theme.typography.scale.lg,
    color: theme.colors.success,
  },
  activeBody: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  activeRemaining: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
  },
});
