import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TrialRemainingRing } from '@/features/billing/components/trial-remaining-ring';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { resolveHomeTrialDiscovery } from '@/features/billing/lib/resolve-home-trial-discovery';
import { theme } from '@/theme/theme';
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
        <Text style={styles.activeMark} accessibilityElementsHidden>
          ✓
        </Text>
        <Text style={styles.activeTitle} numberOfLines={1}>
          {discovery.title}
        </Text>
        {discovery.remainingDayCount !== null && discovery.remainingProgress !== null ? (
          <TrialRemainingRing
            dayCount={discovery.remainingDayCount}
            progress={discovery.remainingProgress}
            accessibilityLabel={discovery.remainingLabel ?? `${discovery.remainingDayCount} days remaining`}
          />
        ) : (
          <Text style={styles.activeRemaining} testID="home-trial-discovery-remaining">
            {discovery.remainingLabel ?? discovery.body}
          </Text>
        )}
      </View>
    );
  }
  return (
    <View style={styles.offerCard} testID="home-trial-discovery-offer">
      <View style={styles.offerCopy}>
        <Text style={styles.offerTitle}>{discovery.title}</Text>
        <Text style={styles.offerBody}>{discovery.body}</Text>
      </View>
      <Pressable
        style={styles.offerButton}
        onPress={() => {
          router.push('/(app)/subscription' as Href);
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  offerCopy: {
    flex: 1,
    gap: 2,
  },
  offerTitle: {
    ...theme.typography.button,
    fontSize: theme.typography.scale.base,
    color: theme.colors.textOnBrand,
  },
  offerBody: {
    ...theme.typography.label,
    color: theme.colors.textOnBrand,
    opacity: 0.82,
  },
  offerButton: {
    minHeight: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  offerButtonLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  activeCard: {
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.successBg,
    borderWidth: 1,
    borderColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  activeMark: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
  },
  activeTitle: {
    ...theme.typography.label,
    flex: 1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
  },
  activeRemaining: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
  },
});
