import { useContext } from 'react';

import { SessionContext } from '@/session/session-provider';
import type { SessionValue } from '@/session/session.types';

/**
 * Returns the application session. Must be used under SessionProvider.
 */
export function useSession(): SessionValue {
  const value: SessionValue | null = useContext(SessionContext);
  if (value === null) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return value;
}
