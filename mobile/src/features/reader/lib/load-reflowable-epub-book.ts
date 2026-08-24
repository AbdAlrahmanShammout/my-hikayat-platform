import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import { downloadAndDecryptBookSource } from '@/features/reader/lib/download-and-decrypt-book-source';
import { parseEpubBook, type ParsedEpubBook } from '@/features/reader/lib/parse-epub-book';

export type LoadReflowableEpubInput = {
  readonly bookId: number;
  readonly sessionId: number;
  readonly deliveryGrant: BookAssetDeliveryGrant;
};

/**
 * Downloads encrypted EPUB, verifies checksum, decrypts in memory, and parses spine chapters.
 */
export async function loadReflowableEpubBook(
  input: LoadReflowableEpubInput,
): Promise<ParsedEpubBook> {
  const plaintext: Uint8Array = await downloadAndDecryptBookSource(input);
  return parseEpubBook(plaintext);
}
