import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { writeAccessToken } from '@/api/access-token-store';
import { queryKeys } from '@/api/query-keys';
import {
  acceptAdminInvitation,
  type AcceptAdminInvitationRequest,
} from '@/features/auth/api/accept-admin-invitation';
import type { AuthSession } from '@/features/auth/api/auth-session';

/**
 * Accepts an invitation, stores the access token, and seeds the current-user cache.
 */
export function useAcceptAdminInvitation(): UseMutationResult<
  AuthSession,
  Error,
  AcceptAdminInvitationRequest
> {
  const queryClient = useQueryClient();
  return useMutation<AuthSession, Error, AcceptAdminInvitationRequest>({
    mutationFn: acceptAdminInvitation,
    onSuccess: (session) => {
      writeAccessToken(session.accessToken);
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}
