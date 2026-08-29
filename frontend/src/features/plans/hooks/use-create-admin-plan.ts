import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createAdminPlan } from '@/features/plans/api/create-admin-plan';
import { invalidateAdminPlansQueries } from '@/features/plans/lib/invalidate-admin-plans-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/plans mutation.
 */
export function useCreateAdminPlan(): UseMutationResult<
  components['schemas']['PlanResponse'],
  Error,
  components['schemas']['CreatePlanRequestDto']
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminPlan,
    onSuccess: async () => {
      await invalidateAdminPlansQueries(queryClient);
    },
  });
}
