import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { clearSessionTokens, readRefreshToken } from '@/api/access-token-store';
import { logoutSession } from '@/features/auth/api/logout-session';

/**
 * Revokes refresh when present, clears the tab session and Query cache, then returns to login.
 */
export function useSignOut(): () => void {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (): void => {
    const refreshToken: string | null = readRefreshToken();
    if (refreshToken !== null) {
      void logoutSession(refreshToken).catch(() => undefined);
    }
    clearSessionTokens();
    queryClient.clear();
    void navigate('/login', { replace: true });
  };
}
