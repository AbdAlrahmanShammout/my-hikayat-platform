import { useEffect, useState } from 'react';

import {
  resolveOfflineLeaseExpiryPresentation,
  type OfflineLeaseExpiryPresentation,
} from '@/features/offline/lib/resolve-offline-lease-expiry-presentation';
import { resolveTrustedNow } from '@/storage/offline-trusted-time-storage';

/**
 * Display-only lease label state from stored expiry and trusted time.
 * Does not validate signatures or grant offline access.
 */
export function useOfflineLeaseExpiryPresentation(
  expiresAt: string | null | undefined,
): OfflineLeaseExpiryPresentation | null {
  const [presentation, setPresentation] = useState<OfflineLeaseExpiryPresentation | null>(null);
  useEffect(() => {
    let isCancelled = false;
    void resolveTrustedNow().then((trusted) => {
      if (isCancelled) {
        return;
      }
      setPresentation(
        resolveOfflineLeaseExpiryPresentation({
          expiresAt,
          nowMs: trusted.nowMs,
          isClockRollbackDetected: trusted.isClockRollbackDetected,
        }),
      );
    });
    return () => {
      isCancelled = true;
    };
  }, [expiresAt]);
  return presentation;
}
