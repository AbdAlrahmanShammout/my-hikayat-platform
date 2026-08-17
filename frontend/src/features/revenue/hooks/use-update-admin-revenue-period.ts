import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  updateAdminRevenuePeriod,
  type UpdateAdminRevenuePeriodInput,
} from '@/features/revenue/api/update-admin-revenue-period';
import { invalidateAdminRevenuePeriodsQueries } from '@/features/revenue/lib/invalidate-admin-revenue-periods-queries';
import type { components } from '@/generated/admin';

/**
 * PATCH /admin/revenue-periods/:id mutation.
 */
export function useUpdateAdminRevenuePeriod(): UseMutationResult<
  components['schemas']['RevenuePeriodResponse'],
  Error,
  UpdateAdminRevenuePeriodInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminRevenuePeriod,
    onSuccess: async () => {
      await invalidateAdminRevenuePeriodsQueries(queryClient);
    },
  });
}
