export type MoveCollectionBookInput = {
  readonly bookIds: readonly number[];
  readonly index: number;
  readonly direction: -1 | 1;
};

/**
 * Returns a new book-id list with one item moved up or down. Out-of-range moves are unchanged.
 */
export function moveCollectionBook(input: MoveCollectionBookInput): number[] {
  const nextBookIds: number[] = [...input.bookIds];
  const targetIndex: number = input.index + input.direction;
  if (input.index < 0 || input.index >= nextBookIds.length) {
    return nextBookIds;
  }
  if (targetIndex < 0 || targetIndex >= nextBookIds.length) {
    return nextBookIds;
  }
  const [movedBookId] = nextBookIds.splice(input.index, 1);
  nextBookIds.splice(targetIndex, 0, movedBookId);
  return nextBookIds;
}
