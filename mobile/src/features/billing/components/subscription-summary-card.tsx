import { useState, type JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { SubscriptionManageSheet } from '@/features/billing/components/subscription-manage-sheet';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { formatSubscriptionDisplay } from '@/features/billing/lib/format-subscription-display';
import {
  resolveMeSubscriptionSummary,
  type MeSubscriptionSummary,
} from '@/features/billing/lib/resolve-me-subscription-summary';
import { theme } from '@/theme/theme';
import { FormError } from '@/ui/forms/form-error';
import { toViewShadow } from '@/ui/lib/to-view-shadow';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';

const PLANS_HREF = '/(app)/plans' as Href;

/**
 * Me subscription status. Plans live on the plans screen; paid management is a sheet.
 */
export function SubscriptionSummaryCard(): JSX.Element {
  const billing = useReaderSubscription();
  const [isManageOpen, setIsManageOpen] = useState<boolean>(false);
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
        <Text style={styles.kicker}>Subscription</Text>
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
  const summary: MeSubscriptionSummary = resolveMeSubscriptionSummary({
    display,
    planName: billing.subscription.plan?.name ?? 'Subscription',
  });
  return (
    <View style={styles.card} testID="billing-subscription-summary">
      <Text style={styles.kicker}>Subscription</Text>
      <Text style={styles.title} testID="billing-subscription-title">
        {summary.title}
      </Text>
      <Text style={styles.detail} testID="billing-subscription-detail">
        {summary.detail}
      </Text>
      {summary.note !== null ? (
        <Text style={styles.note} testID="billing-subscription-note">
          {summary.note}
        </Text>
      ) : null}
      {summary.action === 'start_trial' && billing.trialErrorMessage !== null ? (
        <FormError message={billing.trialErrorMessage} testID="billing-trial-error" />
      ) : null}
      <Button
        label={summary.actionLabel}
        variant={summary.action === 'manage' ? 'secondary' : 'primary'}
        isLoading={summary.action === 'start_trial' && billing.isStartingTrial}
        onPress={() => {
          if (summary.action === 'manage') {
            setIsManageOpen(true);
            return;
          }
          if (summary.action === 'start_trial') {
            void billing.startTrial().catch(() => {
              // Error surfaces via trialErrorMessage.
            });
            return;
          }
          router.push(PLANS_HREF);
        }}
        accessibilityLabel={summary.actionLabel}
        testID="billing-subscription-action"
      />
      <SubscriptionManageSheet
        isVisible={isManageOpen}
        display={display}
        onDismiss={() => {
          setIsManageOpen(false);
        }}
      />
    </View>
  );
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
  kicker: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  detail: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
});
