import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createAdminInvitation } from '@/features/invitations/api/create-admin-invitation';
import { invalidateAdminInvitationsQueries } from '@/features/invitations/lib/invalidate-admin-invitations-queries';
import type { components } from '@/generated/admin';

/**
 * POST /admin/invitations mutation.
 */
export function useCreateAdminInvitation(): UseMutationResult<
  components['schemas']['CreateAdminInvitationResponseDto'],
  Error,
  components['schemas']['CreateAdminInvitationRequestDto']
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminInvitation,
    onSuccess: async () => {
      await invalidateAdminInvitationsQueries(queryClient);
    },
  });
}
