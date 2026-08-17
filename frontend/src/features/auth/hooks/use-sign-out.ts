import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { clearAccessToken } from '@/api/access-token-store';

/**
 * Clears the tab session and Query cache, then returns to login.
 */
export function useSignOut(): () => void {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (): void => {
    clearAccessToken();
    queryClient.clear();
    void navigate('/login', { replace: true });
  };
}
