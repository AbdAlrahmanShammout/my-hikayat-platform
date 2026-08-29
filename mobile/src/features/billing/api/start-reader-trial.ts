import { requestJson } from '@/api/client';
import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';

/**
 * Starts the one-time no-card free trial. Backend owns eligibility and dates.
 */
export async function startReaderTrial(): Promise<ReaderSubscription> {
  return requestJson<ReaderSubscription>({
    path: '/reader/billing/trial/start',
    method: 'POST',
  });
}
