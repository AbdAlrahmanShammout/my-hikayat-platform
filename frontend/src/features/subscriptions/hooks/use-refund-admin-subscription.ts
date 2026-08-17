import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { refundAdminSubscription } from '@/features/subscriptions/api/refund-admin-subscription';
import { invalidateAdminSubscriptionsQueries } from '@/features/subscriptions/lib/invalidate-admin-subscriptions-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/subscriptions/:id/refund mutation.
 */
export function useRefundAdminSubscription(): UseMutationResult<
  components['schemas']['SubscriptionResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refundAdminSubscription,
    onSuccess: async () => {
      await invalidateAdminSubscriptionsQueries(queryClient);
    },
  });
}
