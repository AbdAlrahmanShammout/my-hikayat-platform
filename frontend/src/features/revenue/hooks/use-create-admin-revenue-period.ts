import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createAdminRevenuePeriod } from '@/features/revenue/api/create-admin-revenue-period';
import { invalidateAdminRevenuePeriodsQueries } from '@/features/revenue/lib/invalidate-admin-revenue-periods-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/revenue-periods mutation.
 */
export function useCreateAdminRevenuePeriod(): UseMutationResult<
  components['schemas']['RevenuePeriodResponse'],
  Error,
  components['schemas']['CreateRevenuePeriodRequestDto']
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminRevenuePeriod,
    onSuccess: async () => {
      await invalidateAdminRevenuePeriodsQueries(queryClient);
    },
  });
}
