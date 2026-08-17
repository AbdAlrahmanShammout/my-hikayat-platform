/**
 * True when the form value matches the current backend weight, so PATCH can be skipped.
 */
export function isSameCategoryWeight(currentWeight: number, nextWeight: number): boolean {
  return currentWeight === nextWeight;
}
