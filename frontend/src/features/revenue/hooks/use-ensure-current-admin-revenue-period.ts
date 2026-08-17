import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { ensureCurrentAdminRevenuePeriod } from '@/features/revenue/api/ensure-current-admin-revenue-period';
import { invalidateAdminRevenuePeriodsQueries } from '@/features/revenue/lib/invalidate-admin-revenue-periods-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/revenue-periods/current mutation.
 */
export function useEnsureCurrentAdminRevenuePeriod(): UseMutationResult<
  components['schemas']['RevenuePeriodResponse'],
  Error,
  void
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ensureCurrentAdminRevenuePeriod,
    onSuccess: async () => {
      await invalidateAdminRevenuePeriodsQueries(queryClient);
    },
  });
}
