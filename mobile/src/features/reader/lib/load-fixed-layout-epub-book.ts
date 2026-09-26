import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import type { BookOpenProgress } from '@/features/reader/lib/download-and-decrypt-book-source';
import { loadBookPlaintext } from '@/features/reader/lib/load-book-plaintext';
import {
  parseFixedLayoutEpub,
  type ParsedFixedLayoutEpub,
} from '@/features/reader/lib/parse-fixed-layout-epub';

export type LoadFixedLayoutEpubInput = {
  readonly bookId: number;
  readonly sessionId: number;
  readonly deliveryGrant: BookAssetDeliveryGrant | null;
  readonly onProgress?: (progress: BookOpenProgress) => void;
};

/**
 * Loads encrypted fixed-layout EPUB bytes, decrypts in memory, and parses spreads.
 */
export async function loadFixedLayoutEpubBook(
  input: LoadFixedLayoutEpubInput,
): Promise<ParsedFixedLayoutEpub> {
  const contentType: string = coerceContentType(input.deliveryGrant?.contentType);
  if (contentType.includes('pdf')) {
    throw new Error('PDF fixed-layout rendering is not available in this build.');
  }
  const plaintext: Uint8Array = await loadBookPlaintext(input);
  input.onProgress?.({ phase: 'preparing' });
  return parseFixedLayoutEpub(plaintext);
}

function coerceContentType(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.toLowerCase();
}
