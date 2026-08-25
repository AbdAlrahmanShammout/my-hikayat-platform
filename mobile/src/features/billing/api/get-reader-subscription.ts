import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type ReaderSubscription = components['schemas']['SubscriptionResponse'];

/**
 * Loads the authenticated reader's current subscription projection.
 */
export async function getReaderSubscription(): Promise<ReaderSubscription> {
  return requestJson<ReaderSubscription>({
    path: '/reader/billing/subscription',
    method: 'GET',
  });
}
