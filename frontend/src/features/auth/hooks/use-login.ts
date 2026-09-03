import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { writeAccessToken, writeRefreshToken } from '@/api/access-token-store';
import { queryKeys } from '@/api/query-keys';
import type { AuthSession } from '@/features/auth/api/auth-session';
import { login, type LoginRequest } from '@/features/auth/api/login';

/**
 * Signs in, stores access/refresh tokens, and seeds the current-user query cache.
 */
export function useLogin(): UseMutationResult<AuthSession, Error, LoginRequest> {
  const queryClient = useQueryClient();
  return useMutation<AuthSession, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (session) => {
      writeAccessToken(session.accessToken);
      writeRefreshToken(session.refreshToken);
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}
