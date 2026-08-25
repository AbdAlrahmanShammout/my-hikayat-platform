/**
 * Stable ciphertext file name for an offline book package.
 */
export function buildOfflineCiphertextFileName(bookId: number, bookAssetId: number): string {
  return `${bookId}-${bookAssetId}.enc`;
}
