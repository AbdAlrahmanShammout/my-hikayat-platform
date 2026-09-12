/**
 * Stable on-device cover file name for one downloaded book.
 */
export function buildOfflineCoverFileName(bookId: number): string {
  return `cover-${bookId}.img`;
}
