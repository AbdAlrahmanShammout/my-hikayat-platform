/**
 * Whether two editorial book-id lists are the same sequence.
 */
export function isSameBookOrder(
  left: readonly number[],
  right: readonly number[],
): boolean {
  return left.length === right.length && left.every((bookId, index) => bookId === right[index]);
}
