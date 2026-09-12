import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { formatSubscriptionDisplay } from '@/features/billing/lib/format-subscription-display';
import { theme } from '@/theme/theme';
import { FormError } from '@/ui/forms/form-error';
import { toViewShadow } from '@/ui/lib/to-view-shadow';
import { Button } from '@/ui/primitives/button';
import { Pill, type PillVariant } from '@/ui/primitives/pill';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Compact Me billing summary. Opens the dedicated Subscription screen for management.
 */
export function SubscriptionSummaryCard(): JSX.Element {
  const billing = useReaderSubscription();
  if (billing.isLoading) {
    return (
      <View style={styles.card} testID="billing-subscription-loading">
        <Skeleton height={20} width="42%" />
        <Skeleton height={16} width="70%" />
        <Skeleton height={theme.controlMinHeight} width="100%" />
      </View>
    );
  }
  if (billing.isError || billing.subscription === undefined) {
    return (
      <View style={styles.card} testID="billing-subscription-error">
        <Text style={styles.heading}>Subscription</Text>
        <FormError message={billing.errorMessage ?? 'Could not load subscription.'} />
        <Button
          label="Try again"
          variant="secondary"
          onPress={() => {
            void billing.refetch();
          }}
          accessibilityLabel="Retry subscription"
          testID="billing-subscription-retry"
        />
      </View>
    );
  }
  const display = formatSubscriptionDisplay(billing.subscription);
  return (
    <Pressable
      style={styles.card}
      onPress={openSubscriptionScreen}
      accessibilityRole="button"
      accessibilityLabel="Open subscription"
      testID="billing-subscription-summary"
    >
      <View style={styles.statusHeader}>
        <Text style={styles.headline}>Subscription</Text>
        <Pill label={display.statusLabel} variant={resolvePillVariant(display.statusLabel)} />
      </View>
      <Text style={styles.value} testID="billing-plan-label">
        {display.planLabel}
      </Text>
      <Text style={styles.note} testID="billing-access-label">
        {`Reading access: ${display.accessLabel}`}
      </Text>
      {display.trialRemainingLabel !== null ? (
        <Text style={styles.note} testID="billing-trial-remaining-label">
          {display.trialRemainingLabel}
        </Text>
      ) : null}
      {display.cancelAccessNote !== null ? (
        <Text style={styles.note} testID="billing-cancel-access-note">
          {display.cancelAccessNote}
        </Text>
      ) : null}
      <Text style={styles.action}>Manage subscription ›</Text>
    </Pressable>
  );
}

function openSubscriptionScreen(): void {
  router.push('/(app)/subscription' as Href);
}

function resolvePillVariant(statusLabel: string): PillVariant {
  if (statusLabel === 'Canceled') {
    return 'warning';
  }
  return 'primary';
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.sm,
    padding: theme.spacing.cardInner,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    ...toViewShadow(theme.shadows.sm),
  },
  heading: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  headline: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  action: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
});
