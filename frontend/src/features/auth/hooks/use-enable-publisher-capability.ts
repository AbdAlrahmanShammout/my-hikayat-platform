import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { writeAccessToken } from '@/api/access-token-store';
import { queryKeys } from '@/api/query-keys';
import type { AuthSession } from '@/features/auth/api/auth-session';
import { enablePublisherCapability } from '@/features/auth/api/enable-publisher-capability';

/**
 * POST /user/publisher for an already signed-in reader. Stores the author session.
 */
export function useEnablePublisherCapability(): UseMutationResult<AuthSession, Error, void> {
  const queryClient = useQueryClient();
  return useMutation<AuthSession, Error, void>({
    mutationFn: (): Promise<AuthSession> => enablePublisherCapability(),
    onSuccess: (session: AuthSession) => {
      writeAccessToken(session.accessToken);
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}
