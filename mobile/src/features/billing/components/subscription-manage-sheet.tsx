import { useState, type JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SubscriptionDisplay } from '@/features/billing/lib/format-subscription-display';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { theme } from '@/theme/theme';
import { FormError } from '@/ui/forms/form-error';
import { BottomSheet } from '@/ui/layout/bottom-sheet';
import { SheetHeader } from '@/ui/layout/sheet-header';
import { Button } from '@/ui/primitives/button';

type ManageStep = 'menu' | 'cancel' | 'refund';

type SubscriptionManageSheetProps = {
  readonly isVisible: boolean;
  readonly display: SubscriptionDisplay;
  readonly onDismiss: () => void;
};

/**
 * Paid-plan management from Me. Cancel and refund stay server-authoritative.
 */
export function SubscriptionManageSheet({
  isVisible,
  display,
  onDismiss,
}: SubscriptionManageSheetProps): JSX.Element {
  const billing = useReaderSubscription();
  const [step, setStep] = useState<ManageStep>('menu');
  function dismiss(): void {
    if (billing.isCanceling || billing.isRefunding) {
      return;
    }
    setStep('menu');
    onDismiss();
  }
  return (
    <BottomSheet isVisible={isVisible} onDismiss={dismiss} accessibilityLabel="Manage subscription">
      <View style={styles.body}>
        {step === 'cancel' ? (
          <CancelStep
            periodLabel={display.periodLabel}
            errorMessage={billing.cancelErrorMessage}
            isCanceling={billing.isCanceling}
            onConfirm={() => {
              void billing.requestCancel().then(() => {
                setStep('menu');
                onDismiss();
              }).catch(() => {
                // Error surfaces via cancelErrorMessage.
              });
            }}
            onBack={() => {
              setStep('menu');
            }}
          />
        ) : null}
        {step === 'refund' ? (
          <RefundStep
            errorMessage={billing.refundErrorMessage}
            isRefunding={billing.isRefunding}
            onConfirm={() => {
              void billing.requestRefund().then(() => {
                setStep('menu');
                onDismiss();
              }).catch(() => {
                // Error surfaces via refundErrorMessage.
              });
            }}
            onBack={() => {
              setStep('menu');
            }}
          />
        ) : null}
        {step === 'menu' ? (
          <MenuStep
            canCancel={display.canOfferCancelAction}
            canRefund={display.canOfferRefundAction}
            onCancel={() => {
              setStep('cancel');
            }}
            onRefund={() => {
              setStep('refund');
            }}
            onClose={dismiss}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}

function MenuStep(input: {
  readonly canCancel: boolean;
  readonly canRefund: boolean;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
  readonly onClose: () => void;
}): JSX.Element {
  return (
    <>
      <SheetHeader title="Manage" />
      {input.canCancel ? (
        <Button
          label="Cancel subscription"
          variant="secondary"
          onPress={input.onCancel}
          accessibilityLabel="Cancel subscription"
          testID="billing-cancel-button"
        />
      ) : null}
      {input.canRefund ? (
        <Button
          label="Request refund"
          variant="secondary"
          onPress={input.onRefund}
          accessibilityLabel="Request refund"
          testID="billing-refund-button"
        />
      ) : null}
      <Button
        label="Close"
        variant="secondary"
        onPress={input.onClose}
        accessibilityLabel="Close manage"
        testID="billing-manage-close"
      />
    </>
  );
}

function CancelStep(input: {
  readonly periodLabel: string | null;
  readonly errorMessage: string | null;
  readonly isCanceling: boolean;
  readonly onConfirm: () => void;
  readonly onBack: () => void;
}): JSX.Element {
  const copy: string =
    input.periodLabel === null
      ? 'Cancel your subscription? You can keep reading until the paid period ends. This is not a refund.'
      : `Cancel your subscription? You can keep reading until the paid period ends (${input.periodLabel}). This is not a refund.`;
  return (
    <>
      <SheetHeader title="Cancel subscription?" />
      <Text style={styles.message} testID="billing-cancel-sheet-copy">
        {copy}
      </Text>
      {input.errorMessage !== null ? (
        <FormError message={input.errorMessage} testID="billing-cancel-error" />
      ) : null}
      <Button
        label="Confirm cancel"
        variant="destructive"
        isLoading={input.isCanceling}
        onPress={input.onConfirm}
        accessibilityLabel="Confirm subscription cancellation"
        testID="billing-cancel-confirm"
      />
      <Button
        label="Not now"
        variant="secondary"
        isDisabled={input.isCanceling}
        onPress={input.onBack}
        accessibilityLabel="Keep subscription"
        testID="billing-cancel-dismiss"
      />
    </>
  );
}

function RefundStep(input: {
  readonly errorMessage: string | null;
  readonly isRefunding: boolean;
  readonly onConfirm: () => void;
  readonly onBack: () => void;
}): JSX.Element {
  return (
    <>
      <SheetHeader title="Request a refund?" />
      <Text style={styles.message}>
        Request a refund? The server checks the 7-day window.
      </Text>
      {input.errorMessage !== null ? (
        <FormError message={input.errorMessage} testID="billing-refund-error" />
      ) : null}
      <Button
        label="Confirm refund"
        variant="destructive"
        isLoading={input.isRefunding}
        onPress={input.onConfirm}
        accessibilityLabel="Confirm refund request"
        testID="billing-refund-confirm"
      />
      <Button
        label="Not now"
        variant="secondary"
        isDisabled={input.isRefunding}
        onPress={input.onBack}
        accessibilityLabel="Cancel refund"
        testID="billing-refund-cancel"
      />
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
});
