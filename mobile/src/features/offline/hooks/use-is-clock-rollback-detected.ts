import { useEffect, useState } from 'react';

import { resolveTrustedNow } from '@/storage/offline-trusted-time-storage';

/**
 * Display-only device-clock rollback flag. Open-path lease validation stays fail-closed.
 */
export function useIsClockRollbackDetected(): boolean {
  const [isClockRollbackDetected, setIsClockRollbackDetected] = useState<boolean>(false);
  useEffect(() => {
    let isCancelled = false;
    void resolveTrustedNow().then((trusted) => {
      if (!isCancelled) {
        setIsClockRollbackDetected(trusted.isClockRollbackDetected);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);
  return isClockRollbackDetected;
}
