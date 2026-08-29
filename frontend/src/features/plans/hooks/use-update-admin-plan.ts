import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { updateAdminPlan } from '@/features/plans/api/update-admin-plan';
import { invalidateAdminPlansQueries } from '@/features/plans/lib/invalidate-admin-plans-queries';
import type { components } from '@/generated/admin';

export type UpdateAdminPlanVariables = {
  readonly planId: number;
  readonly body: components['schemas']['UpdatePlanRequestDto'];
};

/**
 * PATCH /admin/plans/:id mutation.
 */
export function useUpdateAdminPlan(): UseMutationResult<
  components['schemas']['PlanResponse'],
  Error,
  UpdateAdminPlanVariables
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, body }: UpdateAdminPlanVariables) => updateAdminPlan(planId, body),
    onSuccess: async () => {
      await invalidateAdminPlansQueries(queryClient);
    },
  });
}
