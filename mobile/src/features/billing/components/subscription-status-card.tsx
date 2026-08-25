import { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatSubscriptionDisplay } from '@/features/billing/lib/format-subscription-display';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { theme } from '@/theme/theme';

/**
 * Profile billing card: plan/status, Stripe Checkout, and refund (server-authoritative).
 */
export function SubscriptionStatusCard(): JSX.Element {
  const billing = useReaderSubscription();
  const [confirmRefund, setConfirmRefund] = useState<boolean>(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

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
        <SubscribeButton
          isCheckingOut={billing.isCheckingOut}
          onPress={async () => {
            const message: string | null = await billing.startCheckout();
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
      <SubscribeButton
        isCheckingOut={billing.isCheckingOut}
        onPress={async () => {
          const message: string | null = await billing.startCheckout();
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

function SubscribeButton(input: {
  readonly isCheckingOut: boolean;
  readonly onPress: () => Promise<void>;
}): JSX.Element {
  return (
    <Pressable
      style={[styles.primaryButton, input.isCheckingOut ? styles.disabled : null]}
      disabled={input.isCheckingOut}
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
