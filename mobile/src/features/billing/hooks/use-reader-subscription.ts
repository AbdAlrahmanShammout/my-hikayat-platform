import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/api-error';
import { getReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import { requestReaderRefund } from '@/features/billing/api/request-reader-refund';
import { executeStripeCheckoutFlow } from '@/features/billing/lib/execute-stripe-checkout-flow';

const SUBSCRIPTION_QUERY_KEY = ['reader', 'billing', 'subscription'] as const;

/**
 * Loads subscription status and supports refund / Stripe Checkout (backend is source of truth).
 */
export function useReaderSubscription(): {
  readonly subscription: Awaited<ReturnType<typeof getReaderSubscription>> | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage: string | null;
  readonly refetch: () => Promise<void>;
  readonly requestRefund: () => Promise<void>;
  readonly isRefunding: boolean;
  readonly refundErrorMessage: string | null;
  readonly startCheckout: () => Promise<string | null>;
  readonly isCheckingOut: boolean;
  readonly checkoutMessage: string | null;
} {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: getReaderSubscription,
    staleTime: 0,
  });
  const refundMutation = useMutation({
    mutationFn: requestReaderRefund,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    },
  });
  const checkoutMutation = useMutation({
    mutationFn: executeStripeCheckoutFlow,
  });

  async function refetchSubscription(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    await query.refetch();
  }

  return {
    subscription: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.isError ? mapBillingError(query.error) : null,
    refetch: async () => {
      await refetchSubscription();
    },
    requestRefund: async () => {
      await refundMutation.mutateAsync();
    },
    isRefunding: refundMutation.isPending,
    refundErrorMessage:
      refundMutation.error === null ? null : mapBillingError(refundMutation.error),
    startCheckout: async () => {
      const result = await checkoutMutation.mutateAsync();
      await refetchSubscription();
      if (result.kind === 'success_return') {
        return 'Checkout finished. Refreshing your plan from the server…';
      }
      if (result.kind === 'cancel_return') {
        return 'Checkout was canceled. Your plan was not changed.';
      }
      if (result.kind === 'dismissed') {
        return 'Checkout closed. Your plan updates only after the server confirms payment.';
      }
      return result.message;
    },
    isCheckingOut: checkoutMutation.isPending,
    checkoutMessage: null,
  };
}

function mapBillingError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      return 'No subscription is set up yet. Ask a grown-up to subscribe.';
    }
    if (error.message.trim().length > 0) {
      return error.message;
    }
  }
  return 'Could not talk to billing right now.';
}
