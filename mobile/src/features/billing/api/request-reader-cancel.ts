import { requestJson } from '@/api/client';
import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';

/**
 * Requests reader-initiated subscription cancellation (access continues until period end).
 */
export async function requestReaderCancel(): Promise<ReaderSubscription> {
  return requestJson<ReaderSubscription>({
    path: '/reader/billing/cancel',
    method: 'POST',
  });
}
