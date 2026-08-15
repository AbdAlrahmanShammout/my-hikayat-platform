export function allocateCentsByWeights(input: {
  readonly weights: readonly number[];
  readonly totalCents: number;
}): number[] {
  if (input.totalCents === 0 || input.weights.length === 0) {
    return input.weights.map(() => 0);
  }
  const weightSum: number = input.weights.reduce((sum: number, weight: number) => sum + weight, 0);
  if (weightSum <= 0) {
    return input.weights.map(() => 0);
  }
  const floors: number[] = input.weights.map((weight: number) =>
    Math.floor((weight / weightSum) * input.totalCents),
  );
  let remainder: number =
    input.totalCents - floors.reduce((sum: number, value: number) => sum + value, 0);
  const ranked = input.weights
    .map((weight: number, index: number) => ({
      index,
      fraction: (weight / weightSum) * input.totalCents - floors[index],
    }))
    .sort((left, right) => {
      if (right.fraction !== left.fraction) {
        return right.fraction - left.fraction;
      }
      return left.index - right.index;
    });
  const allocated: number[] = [...floors];
  for (const entry of ranked) {
    if (remainder <= 0) {
      break;
    }
    allocated[entry.index] += 1;
    remainder -= 1;
  }
  return allocated;
}
