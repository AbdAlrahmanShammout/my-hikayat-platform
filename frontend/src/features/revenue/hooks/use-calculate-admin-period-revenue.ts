import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { calculateAdminPeriodRevenue } from '@/features/revenue/api/calculate-admin-period-revenue';
import { invalidateAdminRevenuePeriodsQueries } from '@/features/revenue/lib/invalidate-admin-revenue-periods-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/revenue-periods/:id/calculate mutation.
 */
export function useCalculateAdminPeriodRevenue(): UseMutationResult<
  components['schemas']['GetAdminPeriodEarningsResponseDto'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calculateAdminPeriodRevenue,
    onSuccess: async () => {
      await invalidateAdminRevenuePeriodsQueries(queryClient);
    },
  });
}
