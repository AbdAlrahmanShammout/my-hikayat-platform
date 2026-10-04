import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import type { AdminInvitationRecord } from '@/features/invitations/api/admin-invitation-record';
import { revokeAdminInvitation } from '@/features/invitations/api/revoke-admin-invitation';
import { invalidateAdminInvitationsQueries } from '@/features/invitations/lib/invalidate-admin-invitations-queries';

type RevokeInvitationInput = {
  readonly invitationId: number;
  readonly reason: string | undefined;
};

/**
 * POST /admin/invitations/:id/revoke mutation.
 */
export function useRevokeAdminInvitation(): UseMutationResult<
  AdminInvitationRecord,
  Error,
  RevokeInvitationInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RevokeInvitationInput) =>
      revokeAdminInvitation(input.invitationId, input.reason),
    onSuccess: async () => {
      await invalidateAdminInvitationsQueries(queryClient);
    },
  });
}
