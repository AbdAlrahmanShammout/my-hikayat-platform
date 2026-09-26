import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listReaderBillingPlans,
  type ReaderBillingPlan,
} from '@/features/billing/api/list-reader-billing-plans';
import { mapBillingError } from '@/features/billing/lib/map-billing-error';

const PLANS_QUERY_KEY = ['reader', 'billing', 'plans'] as const;

/**
 * Loads the paid plan catalog. Entitlement stays on the server.
 */
export function useReaderBillingPlans(): {
  readonly plans: readonly ReaderBillingPlan[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage: string | null;
  readonly refetch: () => Promise<void>;
} {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: listReaderBillingPlans,
    staleTime: 60_000,
  });
  return {
    plans: query.data?.plans ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.isError ? mapBillingError(query.error) : null,
    refetch: async () => {
      await queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      await query.refetch();
    },
  };
}
