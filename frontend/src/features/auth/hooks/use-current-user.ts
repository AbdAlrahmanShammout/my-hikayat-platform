import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getCurrentUser } from '@/features/auth/api/get-current-user';
import { useAccessToken } from '@/features/auth/hooks/use-access-token';
import type { User } from '@/types/user';

/**
 * Server-state hook for GET /auth/me. Disabled when no access token is stored.
 */
export function useCurrentUser(): UseQueryResult<User, Error> {
  const accessToken: string | null = useAccessToken();
  return useQuery<User, Error>({
    queryKey: queryKeys.auth.me(),
    queryFn: getCurrentUser,
    enabled: accessToken !== null,
  });
}
