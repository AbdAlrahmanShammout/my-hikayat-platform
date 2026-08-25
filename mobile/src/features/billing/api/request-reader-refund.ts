import { requestJson } from '@/api/client';
import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';

/**
 * Requests a reader-initiated subscription refund (backend enforces the 7-day window).
 */
export async function requestReaderRefund(): Promise<ReaderSubscription> {
  return requestJson<ReaderSubscription>({
    path: '/reader/billing/refund',
    method: 'POST',
  });
}
