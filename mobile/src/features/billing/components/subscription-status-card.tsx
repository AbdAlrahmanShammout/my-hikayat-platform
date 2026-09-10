import { useState, type JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ReaderBillingPlan } from '@/features/billing/api/list-reader-billing-plans';
import { formatPlanPriceLabel } from '@/features/billing/lib/format-plan-price-label';
import {
  formatSubscriptionDisplay,
  type SubscriptionDisplay,
} from '@/features/billing/lib/format-subscription-display';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { theme } from '@/theme/theme';
import { FormError } from '@/ui/forms/form-error';
import { BottomSheet } from '@/ui/layout/bottom-sheet';
import { toViewShadow } from '@/ui/lib/to-view-shadow';
import { Button } from '@/ui/primitives/button';
import { Pill, type PillVariant } from '@/ui/primitives/pill';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Profile billing card: plan/status, free trial, plan picker, Stripe Checkout, cancel, and refund.
 */
export function SubscriptionStatusCard(): JSX.Element {
  const billing = useReaderSubscription();
  const [confirmRefund, setConfirmRefund] = useState<boolean>(false);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const effectivePlanId: number | null =
    selectedPlanId ?? billing.plans[0]?.id ?? null;

  if (billing.isLoading) {
    return (
      <View style={styles.card} testID="billing-subscription-loading">
        <Skeleton height={20} width="42%" />
        <Skeleton height={16} width="70%" />
        <Skeleton height={16} width="54%" />
        <Skeleton height={theme.controlMinHeight} width="100%" />
      </View>
    );
  }

  if (billing.isError || billing.subscription === undefined) {
    return (
      <View style={styles.card} testID="billing-subscription-error">
        <Text style={styles.heading}>Subscription</Text>
        <FormError
          message={billing.errorMessage ?? 'Could not load subscription.'}
        />
        <Button
          label="Try again"
          variant="secondary"
          onPress={() => {
            void billing.refetch();
          }}
          accessibilityLabel="Retry subscription"
          testID="billing-subscription-retry"
        />
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
  const statusPresentation = resolveStatusPresentation(display);

  return (
    <View style={styles.card} testID="billing-subscription-card">
      <View style={styles.statusHeader}>
        <Text style={styles.headline}>{statusPresentation.headline}</Text>
        <Pill label={statusPresentation.pillLabel} variant={statusPresentation.pillVariant} />
      </View>
      <Text style={styles.label}>Plan</Text>
      <Text style={styles.value} testID="billing-plan-label">
        {display.planLabel}
      </Text>
      <Text style={styles.label}>Reading access</Text>
      <Text style={styles.value} testID="billing-access-label">
        {display.accessLabel}
      </Text>
      <Text style={styles.label}>Status</Text>
      <Text style={styles.value} testID="billing-status-label">
        {display.statusLabel}
      </Text>
      {display.trialRemainingLabel !== null ? (
        <>
          <Text style={styles.label}>Free trial</Text>
          <Text style={styles.value} testID="billing-trial-remaining-label">
            {display.trialRemainingLabel}
          </Text>
          <Text style={styles.note} testID="billing-trial-active-note">
            You are on a free trial. Full-book reading is checked by the server.
            No card was charged for this trial.
          </Text>
        </>
      ) : null}
      {display.periodLabel !== null ? (
        <>
          <Text style={styles.label}>Period</Text>
          <Text style={styles.value} testID="billing-period-label">
            {display.periodLabel}
          </Text>
        </>
      ) : null}
      {display.cancelAccessNote !== null ? (
        <Text style={styles.note} testID="billing-cancel-access-note">
          {display.cancelAccessNote}
        </Text>
      ) : null}
      <Text style={styles.note}>
        Full-book reading follows your plan on the server. Ask a grown-up before
        changing billing.
      </Text>
      {display.canOfferTrialAction ? (
        <View style={styles.trialBlock} testID="billing-trial-offer">
          <Text style={styles.note} testID="billing-trial-offer-note">
            7 days free — no credit card required. This does not start a paid
            subscription by itself.
          </Text>
          {billing.trialErrorMessage !== null ? (
            <FormError message={billing.trialErrorMessage} testID="billing-trial-error" />
          ) : null}
          <Button
            label="Start Free Trial"
            isLoading={billing.isStartingTrial}
            onPress={() => {
              void billing.startTrial().catch(() => {
                // Error surfaces via trialErrorMessage; subscription is refreshed.
              });
            }}
            accessibilityLabel="Start free trial"
            testID="billing-start-trial-button"
          />
        </View>
      ) : null}
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
      {display.canOfferCancelAction ? (
        <Button
          label="Cancel subscription"
          variant="secondary"
          onPress={() => {
            setConfirmCancel(true);
            setConfirmRefund(false);
          }}
          accessibilityLabel="Cancel subscription"
          testID="billing-cancel-button"
        />
      ) : null}
      {display.canOfferRefundAction ? (
        <Button
          label="Request refund"
          variant="secondary"
          onPress={() => {
            setConfirmRefund(true);
            setConfirmCancel(false);
          }}
          accessibilityLabel="Request refund"
          testID="billing-refund-button"
        />
      ) : null}
      <BottomSheet
        isVisible={confirmCancel}
        onDismiss={() => {
          setConfirmCancel(false);
        }}
        accessibilityLabel="Cancel subscription"
      >
        <View style={styles.sheetBody}>
          <Text style={styles.sheetTitle}>Cancel subscription?</Text>
          <Text style={styles.sheetMessage}>
            Cancel your subscription? You can keep reading until the paid
            period ends. This is not a refund.
          </Text>
          {billing.cancelErrorMessage !== null ? (
            <FormError message={billing.cancelErrorMessage} testID="billing-cancel-error" />
          ) : null}
          <Button
            label="Confirm cancel"
            variant="destructive"
            isLoading={billing.isCanceling}
            onPress={() => {
              void billing
                .requestCancel()
                .then(() => {
                  setConfirmCancel(false);
                })
                .catch(() => {
                  // Error surfaces via cancelErrorMessage.
                });
            }}
            accessibilityLabel="Confirm subscription cancellation"
            testID="billing-cancel-confirm"
          />
          <Button
            label="Not now"
            variant="secondary"
            isDisabled={billing.isCanceling}
            onPress={() => {
              setConfirmCancel(false);
            }}
            accessibilityLabel="Keep subscription"
            testID="billing-cancel-dismiss"
          />
        </View>
      </BottomSheet>
      <BottomSheet
        isVisible={confirmRefund}
        onDismiss={() => {
          setConfirmRefund(false);
        }}
        accessibilityLabel="Request refund"
      >
        <View style={styles.sheetBody}>
          <Text style={styles.sheetTitle}>Request a refund?</Text>
          <Text style={styles.sheetMessage}>
            Request a refund? The server checks the 7-day window.
          </Text>
          {billing.refundErrorMessage !== null ? (
            <FormError message={billing.refundErrorMessage} testID="billing-refund-error" />
          ) : null}
          <Button
            label="Confirm refund"
            variant="destructive"
            isLoading={billing.isRefunding}
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
            accessibilityLabel="Confirm refund request"
            testID="billing-refund-confirm"
          />
          <Button
            label="Not now"
            variant="secondary"
            isDisabled={billing.isRefunding}
            onPress={() => {
              setConfirmRefund(false);
            }}
            accessibilityLabel="Cancel refund"
            testID="billing-refund-cancel"
          />
        </View>
      </BottomSheet>
    </View>
  );
}

function resolveStatusPresentation(display: SubscriptionDisplay): {
  readonly headline: string;
  readonly pillLabel: string;
  readonly pillVariant: PillVariant;
} {
  if (display.trialRemainingLabel !== null) {
    return {
      headline: 'Free trial',
      pillLabel: display.accessLabel,
      pillVariant: 'success',
    };
  }
  if (display.statusLabel === 'Canceled') {
    return {
      headline: 'Canceled',
      pillLabel: display.statusLabel,
      pillVariant: 'warning',
    };
  }
  if (display.accessLabel === 'Paid') {
    return {
      headline: 'Subscribed',
      pillLabel: display.accessLabel,
      pillVariant: 'primary',
    };
  }
  return {
    headline: 'Free browsing',
    pillLabel: display.accessLabel,
    pillVariant: 'neutral',
  };
}

function PlanPicker(input: {
  readonly plans: readonly ReaderBillingPlan[];
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
  return (
    <Button
      label="Subscribe"
      isLoading={input.isCheckingOut}
      isDisabled={input.disabled}
      onPress={() => {
        void input.onPress();
      }}
      accessibilityLabel="Subscribe with Stripe Checkout"
      testID="billing-subscribe-button"
    />
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
    fontSize: theme.typography.scale['2xl'],
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  label: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  trialBlock: {
    gap: theme.spacing.sm,
  },
  planList: {
    gap: theme.spacing.sm,
  },
  planOption: {
    borderWidth: 1.5,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.spacing.md,
    gap: theme.spacing.scale.xs,
  },
  planOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryDim,
  },
  planName: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  planDescription: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  planPrice: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  sheetBody: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  sheetTitle: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  sheetMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
});
