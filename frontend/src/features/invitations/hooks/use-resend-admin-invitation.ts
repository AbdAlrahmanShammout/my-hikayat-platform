import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import type { AdminInvitationRecord } from '@/features/invitations/api/admin-invitation-record';
import { resendAdminInvitation } from '@/features/invitations/api/resend-admin-invitation';
import { invalidateAdminInvitationsQueries } from '@/features/invitations/lib/invalidate-admin-invitations-queries';

/**
 * POST /admin/invitations/:id/resend mutation.
 */
export function useResendAdminInvitation(): UseMutationResult<
  AdminInvitationRecord,
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendAdminInvitation,
    onSuccess: async () => {
      await invalidateAdminInvitationsQueries(queryClient);
    },
  });
}
