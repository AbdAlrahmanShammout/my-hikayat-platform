import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { aggregateAdminPeriodEngagement } from '@/features/revenue/api/aggregate-admin-period-engagement';
import { invalidateAdminRevenuePeriodsQueries } from '@/features/revenue/lib/invalidate-admin-revenue-periods-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/revenue-periods/:id/engagements mutation.
 */
export function useAggregateAdminPeriodEngagement(): UseMutationResult<
  components['schemas']['GetAdminPeriodAnalyticsResponseDto'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aggregateAdminPeriodEngagement,
    onSuccess: async () => {
      await invalidateAdminRevenuePeriodsQueries(queryClient);
    },
  });
}
