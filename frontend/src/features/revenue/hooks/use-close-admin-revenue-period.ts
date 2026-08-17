import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { closeAdminRevenuePeriod } from '@/features/revenue/api/close-admin-revenue-period';
import { invalidateAdminRevenuePeriodsQueries } from '@/features/revenue/lib/invalidate-admin-revenue-periods-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/revenue-periods/:id/close mutation.
 */
export function useCloseAdminRevenuePeriod(): UseMutationResult<
  components['schemas']['RevenuePeriodResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeAdminRevenuePeriod,
    onSuccess: async () => {
      await invalidateAdminRevenuePeriodsQueries(queryClient);
    },
  });
}
