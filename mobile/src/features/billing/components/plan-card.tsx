import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ReaderBillingPlan } from '@/features/billing/api/list-reader-billing-plans';
import { formatPlanPriceLabel } from '@/features/billing/lib/format-plan-price-label';
import { theme } from '@/theme/theme';
import { toViewShadow } from '@/ui/lib/to-view-shadow';
import { Button } from '@/ui/primitives/button';
import { Pill } from '@/ui/primitives/pill';

type PlanCardProps = {
  readonly plan: ReaderBillingPlan;
  readonly isCurrent: boolean;
  readonly isCheckingOut: boolean;
  readonly onSubscribe: (planId: number) => void;
};

/**
 * One catalog plan. Checkout starts only for a purchasable paid plan.
 */
export function PlanCard({
  plan,
  isCurrent,
  isCheckingOut,
  onSubscribe,
}: PlanCardProps): JSX.Element {
  const priceLabel: string = formatPlanPriceLabel(plan.amountCents, plan.currency, plan.interval);
  const canSubscribe: boolean = plan.kind === 'monthly_paid' && !isCurrent;
  return (
    <View style={styles.card} testID={`plan-card-${plan.id}`}>
      <View style={styles.header}>
        <Text style={styles.name}>{plan.name}</Text>
        {isCurrent ? <Pill label="Current" variant="primary" testID={`plan-card-current-${plan.id}`} /> : null}
      </View>
      <Text style={styles.description}>{plan.description}</Text>
      {priceLabel.length > 0 ? (
        <Text style={styles.price} testID={`plan-card-price-${plan.id}`}>
          {priceLabel}
        </Text>
      ) : null}
      {canSubscribe ? (
        <Button
          label="Subscribe"
          isLoading={isCheckingOut}
          onPress={() => {
            onSubscribe(plan.id);
          }}
          accessibilityLabel={`Subscribe to ${plan.name}`}
          testID={`plan-card-subscribe-${plan.id}`}
        />
      ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  name: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  price: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
});
