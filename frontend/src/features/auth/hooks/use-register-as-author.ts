import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { writeAccessToken } from '@/api/access-token-store';
import { queryKeys } from '@/api/query-keys';
import type { AuthSession } from '@/features/auth/api/auth-session';
import { enablePublisherCapability } from '@/features/auth/api/enable-publisher-capability';
import { register, type RegisterRequest } from '@/features/auth/api/register';

/**
 * Registers a reader, then POST /user/publisher so the session can open /author.
 */
export function useRegisterAsAuthor(): UseMutationResult<AuthSession, Error, RegisterRequest> {
  const queryClient = useQueryClient();
  return useMutation<AuthSession, Error, RegisterRequest>({
    mutationFn: async (input: RegisterRequest): Promise<AuthSession> => {
      const readerSession: AuthSession = await register(input);
      try {
        return await enablePublisherCapability(readerSession.accessToken);
      } catch (error: unknown) {
        writeAccessToken(readerSession.accessToken);
        queryClient.setQueryData(queryKeys.auth.me(), readerSession.user);
        throw error;
      }
    },
    onSuccess: (session: AuthSession) => {
      writeAccessToken(session.accessToken);
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}
