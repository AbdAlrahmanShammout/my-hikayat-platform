import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import { loadBookPlaintext } from '@/features/reader/lib/load-book-plaintext';
import { parseEpubBook, type ParsedEpubBook } from '@/features/reader/lib/parse-epub-book';

export type LoadReflowableEpubInput = {
  readonly bookId: number;
  readonly sessionId: number;
  readonly deliveryGrant: BookAssetDeliveryGrant | null;
};

/**
 * Loads encrypted EPUB bytes (offline package or online grant), decrypts in memory, and parses spine chapters.
 */
export async function loadReflowableEpubBook(
  input: LoadReflowableEpubInput,
): Promise<ParsedEpubBook> {
  const plaintext: Uint8Array = await loadBookPlaintext(input);
  return parseEpubBook(plaintext);
}
