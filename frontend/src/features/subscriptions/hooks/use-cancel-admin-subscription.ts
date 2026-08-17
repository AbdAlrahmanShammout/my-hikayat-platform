import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { cancelAdminSubscription } from '@/features/subscriptions/api/cancel-admin-subscription';
import { invalidateAdminSubscriptionsQueries } from '@/features/subscriptions/lib/invalidate-admin-subscriptions-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/subscriptions/:id/cancel mutation. No refund.
 */
export function useCancelAdminSubscription(): UseMutationResult<
  components['schemas']['SubscriptionResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelAdminSubscription,
    onSuccess: async () => {
      await invalidateAdminSubscriptionsQueries(queryClient);
    },
  });
}
