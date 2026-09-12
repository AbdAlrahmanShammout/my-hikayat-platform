import { useCallback, useEffect, useState } from 'react';

import { resolveTrustedNow } from '@/storage/offline-trusted-time-storage';

/**
 * Display-only device-clock rollback flag. Open-path lease validation stays fail-closed.
 */
export function useIsClockRollbackDetected(): {
  readonly isClockRollbackDetected: boolean;
  readonly refetch: () => Promise<void>;
} {
  const [isClockRollbackDetected, setIsClockRollbackDetected] = useState<boolean>(false);
  const refetch = useCallback(async (): Promise<void> => {
    const trusted = await resolveTrustedNow();
    setIsClockRollbackDetected(trusted.isClockRollbackDetected);
  }, []);
  useEffect(() => {
    void refetch();
  }, [refetch]);
  return {
    isClockRollbackDetected,
    refetch,
  };
}
