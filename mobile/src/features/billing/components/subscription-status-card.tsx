import { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ReaderBillingPlan } from '@/features/billing/api/list-reader-billing-plans';
import { formatPlanPriceLabel } from '@/features/billing/lib/format-plan-price-label';
import { formatSubscriptionDisplay } from '@/features/billing/lib/format-subscription-display';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { theme } from '@/theme/theme';

/**
 * Profile billing card: plan/status, plan picker, Stripe Checkout, and refund.
 */
export function SubscriptionStatusCard(): JSX.Element {
  const billing = useReaderSubscription();
  const [confirmRefund, setConfirmRefund] = useState<boolean>(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const effectivePlanId: number | null =
    selectedPlanId ?? billing.plans[0]?.id ?? null;

  if (billing.isLoading) {
    return (
      <View style={styles.card} testID="billing-subscription-loading">
        <Text style={styles.heading}>Subscription</Text>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (billing.isError || billing.subscription === undefined) {
    return (
      <View style={styles.card} testID="billing-subscription-error">
        <Text style={styles.heading}>Subscription</Text>
        <Text style={styles.error}>
          {billing.errorMessage ?? 'Could not load subscription.'}
        </Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void billing.refetch();
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry subscription"
          testID="billing-subscription-retry"
        >
          <Text style={styles.secondaryLabel}>Try again</Text>
        </Pressable>
        <PlanPicker
          plans={billing.plans}
          selectedPlanId={effectivePlanId}
          onSelect={setSelectedPlanId}
        />
        <SubscribeButton
          isCheckingOut={billing.isCheckingOut}
          disabled={effectivePlanId === null}
          onPress={async () => {
            if (effectivePlanId === null) {
              setCheckoutMessage('Ask a grown-up to pick a plan first.');
              return;
            }
            const message: string | null = await billing.startCheckout(effectivePlanId);
            setCheckoutMessage(message);
          }}
        />
        {checkoutMessage !== null ? (
          <Text style={styles.note} testID="billing-checkout-message">
            {checkoutMessage}
          </Text>
        ) : null}
      </View>
    );
  }

  const display = formatSubscriptionDisplay(billing.subscription);

  return (
    <View style={styles.card} testID="billing-subscription-card">
      <Text style={styles.heading}>Subscription</Text>
      <Text style={styles.label}>Plan</Text>
      <Text style={styles.value} testID="billing-plan-label">
        {display.planLabel}
      </Text>
      <Text style={styles.label}>Status</Text>
      <Text style={styles.value} testID="billing-status-label">
        {display.statusLabel}
      </Text>
      {display.periodLabel !== null ? (
        <>
          <Text style={styles.label}>Period</Text>
          <Text style={styles.value} testID="billing-period-label">
            {display.periodLabel}
          </Text>
        </>
      ) : null}
      <Text style={styles.note}>
        Full-book reading follows your plan on the server. Ask a grown-up before
        changing billing.
      </Text>
      <PlanPicker
        plans={billing.plans}
        selectedPlanId={effectivePlanId}
        onSelect={setSelectedPlanId}
      />
      <SubscribeButton
        isCheckingOut={billing.isCheckingOut}
        disabled={effectivePlanId === null}
        onPress={async () => {
          if (effectivePlanId === null) {
            setCheckoutMessage('Ask a grown-up to pick a plan first.');
            return;
          }
          const message: string | null = await billing.startCheckout(effectivePlanId);
          setCheckoutMessage(message);
        }}
      />
      {checkoutMessage !== null ? (
        <Text style={styles.note} testID="billing-checkout-message">
          {checkoutMessage}
        </Text>
      ) : null}
      {display.canOfferRefundAction ? (
        confirmRefund ? (
          <View style={styles.confirmBlock}>
            <Text style={styles.note}>
              Request a refund? The server checks the 7-day window.
            </Text>
            {billing.refundErrorMessage !== null ? (
              <Text style={styles.error} testID="billing-refund-error">
                {billing.refundErrorMessage}
              </Text>
            ) : null}
            <Pressable
              style={[styles.primaryButton, billing.isRefunding ? styles.disabled : null]}
              disabled={billing.isRefunding}
              onPress={() => {
                void billing
                  .requestRefund()
                  .then(() => {
                    setConfirmRefund(false);
                  })
                  .catch(() => {
                    // Error surfaces via refundErrorMessage.
                  });
              }}
              accessibilityRole="button"
              accessibilityLabel="Confirm refund request"
              testID="billing-refund-confirm"
            >
              {billing.isRefunding ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.primaryLabel}>Confirm refund</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                setConfirmRefund(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Cancel refund"
              testID="billing-refund-cancel"
            >
              <Text style={styles.secondaryLabel}>Not now</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setConfirmRefund(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Request refund"
            testID="billing-refund-button"
          >
            <Text style={styles.secondaryLabel}>Request refund</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}

function PlanPicker(input: {
  readonly plans: ReadonlyArray<ReaderBillingPlan>;
  readonly selectedPlanId: number | null;
  readonly onSelect: (planId: number) => void;
}): JSX.Element | null {
  if (input.plans.length === 0) {
    return (
      <Text style={styles.note} testID="billing-plans-empty">
        No plans are ready to buy yet. Ask a grown-up to check again later.
      </Text>
    );
  }
  return (
    <View style={styles.planList} testID="billing-plans-list">
      <Text style={styles.label}>Choose a plan</Text>
      {input.plans.map((plan) => {
        const isSelected: boolean = plan.id === input.selectedPlanId;
        const priceLabel: string = formatPlanPriceLabel(plan.amountCents, plan.currency);
        return (
          <Pressable
            key={plan.id}
            style={[styles.planOption, isSelected ? styles.planOptionSelected : null]}
            onPress={() => {
              input.onSelect(plan.id);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Select ${plan.name}`}
            testID={`billing-plan-option-${plan.id}`}
          >
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
            {priceLabel.length > 0 ? (
              <Text style={styles.planPrice}>{priceLabel} / month</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function SubscribeButton(input: {
  readonly isCheckingOut: boolean;
  readonly disabled: boolean;
  readonly onPress: () => Promise<void>;
}): JSX.Element {
  const isDisabled: boolean = input.isCheckingOut || input.disabled;
  return (
    <Pressable
      style={[styles.primaryButton, isDisabled ? styles.disabled : null]}
      disabled={isDisabled}
      onPress={() => {
        void input.onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel="Subscribe with Stripe Checkout"
      testID="billing-subscribe-button"
    >
      {input.isCheckingOut ? (
        <ActivityIndicator color={theme.colors.onPrimary} />
      ) : (
        <Text style={styles.primaryLabel}>Subscribe</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  heading: {
    ...theme.typography.label,
    color: theme.colors.primaryMuted,
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  value: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  confirmBlock: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  planList: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  planOption: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    gap: 4,
  },
  planOptionSelected: {
    borderColor: theme.colors.primary,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  planDescription: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  planPrice: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  primaryButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  primaryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
  secondaryButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  secondaryLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  disabled: {
    opacity: 0.7,
  },
});
