import { router, type Href } from 'expo-router';
import { Check } from 'lucide-react-native';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { resolveHomeTrialDiscovery } from '@/features/billing/lib/resolve-home-trial-discovery';
import { theme } from '@/theme/theme';
import { Icon } from '@/ui/primitives/icon';
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
    const remainingLabel: string = discovery.remainingLabel ?? discovery.body;
    return (
      <View style={styles.activeWrap} testID="home-trial-discovery-active">
        <Text style={styles.sectionLabel}>Subscription</Text>
        <View style={styles.activeCard}>
          <View style={styles.statusRow}>
            <View style={styles.checkBadge} accessibilityElementsHidden>
              <Icon icon={Check} color={theme.colors.textOnBrand} size={14} strokeWidth={3} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.activeTitle}>{discovery.title}</Text>
              <Text style={styles.activeRemaining} testID="home-trial-discovery-remaining">
                {remainingLabel}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.upgradeButton}
            onPress={openSubscriptionScreen}
            accessibilityRole="button"
            accessibilityLabel={discovery.actionLabel}
            testID="home-trial-discovery-upgrade"
          >
            <Text style={styles.upgradeLabel}>{discovery.actionLabel}</Text>
          </Pressable>
        </View>
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
        onPress={openSubscriptionScreen}
        accessibilityRole="button"
        accessibilityLabel={discovery.actionLabel}
        testID="home-trial-discovery-action"
      >
        <Text style={styles.offerButtonLabel}>{discovery.actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function openSubscriptionScreen(): void {
  router.push('/(app)/subscription' as Href);
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
  activeWrap: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  activeCard: {
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCopy: {
    flex: 1,
    gap: 2,
  },
  activeTitle: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  activeRemaining: {
    ...theme.typography.label,
    color: theme.colors.success,
  },
  upgradeButton: {
    minHeight: 48,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  upgradeLabel: {
    ...theme.typography.button,
    color: theme.colors.textOnBrand,
  },
});
