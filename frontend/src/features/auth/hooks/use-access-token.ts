import { useEffect, useState } from 'react';

import { readAccessToken, subscribeAccessToken } from '@/api/access-token-store';

/**
 * Subscribes to the tab-scoped Bearer token stored in sessionStorage.
 */
export function useAccessToken(): string | null {
  const [accessToken, setAccessToken] = useState<string | null>(() => readAccessToken());
  useEffect(() => {
    return subscribeAccessToken(() => {
      setAccessToken(readAccessToken());
    });
  }, []);
  return accessToken;
}
