import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/api-error';
import { getReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import { requestReaderRefund } from '@/features/billing/api/request-reader-refund';

const SUBSCRIPTION_QUERY_KEY = ['reader', 'billing', 'subscription'] as const;

/**
 * Loads subscription status and supports a refund mutation (backend-enforced eligibility).
 */
export function useReaderSubscription(): {
  readonly subscription: Awaited<ReturnType<typeof getReaderSubscription>> | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage: string | null;
  readonly refetch: () => void;
  readonly requestRefund: () => Promise<void>;
  readonly isRefunding: boolean;
  readonly refundErrorMessage: string | null;
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
  return {
    subscription: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.isError ? mapBillingError(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
    requestRefund: async () => {
      await refundMutation.mutateAsync();
    },
    isRefunding: refundMutation.isPending,
    refundErrorMessage:
      refundMutation.error === null ? null : mapBillingError(refundMutation.error),
  };
}

function mapBillingError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      return 'No subscription is set up yet. Ask a grown-up to subscribe when checkout is ready.';
    }
    if (error.message.trim().length > 0) {
      return error.message;
    }
  }
  return 'Could not talk to billing right now.';
}
