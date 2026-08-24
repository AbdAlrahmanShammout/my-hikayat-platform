import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type BookAssetDeliveryGrant =
  components['schemas']['CreateBookAssetDeliveryGrantResponseDto'];

/**
 * Requests a time-limited encrypted source delivery URL. Backend enforces entitlement.
 */
export async function createBookAssetDeliveryGrant(
  bookId: number,
): Promise<BookAssetDeliveryGrant> {
  return requestJson<BookAssetDeliveryGrant>({
    path: `/reader/books/${bookId}/delivery-grant`,
    method: 'POST',
  });
}
