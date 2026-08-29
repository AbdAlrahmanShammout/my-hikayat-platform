import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/api-error';
import { getReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import {
  listReaderBillingPlans,
  type ReaderBillingPlan,
} from '@/features/billing/api/list-reader-billing-plans';
import { requestReaderRefund } from '@/features/billing/api/request-reader-refund';
import { executeStripeCheckoutFlow } from '@/features/billing/lib/execute-stripe-checkout-flow';

const SUBSCRIPTION_QUERY_KEY = ['reader', 'billing', 'subscription'] as const;
const PLANS_QUERY_KEY = ['reader', 'billing', 'plans'] as const;

/**
 * Loads subscription status, paid plan catalog, refund, and Stripe Checkout.
 * Backend remains the source of truth for entitlement.
 */
export function useReaderSubscription(): {
  readonly subscription: Awaited<ReturnType<typeof getReaderSubscription>> | undefined;
  readonly plans: ReadonlyArray<ReaderBillingPlan>;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage: string | null;
  readonly refetch: () => Promise<void>;
  readonly requestRefund: () => Promise<void>;
  readonly isRefunding: boolean;
  readonly refundErrorMessage: string | null;
  readonly startCheckout: (planId: number) => Promise<string | null>;
  readonly isCheckingOut: boolean;
  readonly checkoutMessage: string | null;
} {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: getReaderSubscription,
    staleTime: 0,
  });
  const plansQuery = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: listReaderBillingPlans,
    staleTime: 60_000,
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
    await queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
    await query.refetch();
    await plansQuery.refetch();
  }

  return {
    subscription: query.data,
    plans: plansQuery.data?.plans ?? [],
    isLoading: query.isLoading || plansQuery.isLoading,
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
    startCheckout: async (planId: number) => {
      const result = await checkoutMutation.mutateAsync(planId);
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
