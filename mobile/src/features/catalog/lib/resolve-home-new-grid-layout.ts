const MIN_COLUMNS = 2;
const MAX_COLUMNS = 6;
const MIN_CARD_WIDTH = 168;

export type HomeNewGridLayout = {
  readonly columnCount: number;
  readonly itemWidth: number;
};

/**
 * Picks a column count from the row's real width.
 * Phones stay at two columns. A third column starts only on a wider row.
 */
export function resolveHomeNewGridLayout(input: {
  readonly contentWidth: number;
  readonly gap: number;
}): HomeNewGridLayout {
  const contentWidth: number = Math.max(0, input.contentWidth);
  if (contentWidth === 0) {
    return { columnCount: MIN_COLUMNS, itemWidth: MIN_CARD_WIDTH };
  }
  const fittedColumns: number = Math.floor(
    (contentWidth + input.gap) / (MIN_CARD_WIDTH + input.gap),
  );
  const columnCount: number = Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, fittedColumns));
  const rawItemWidth: number = (contentWidth - input.gap * (columnCount - 1)) / columnCount;
  const itemWidth: number = Math.floor(rawItemWidth);
  return { columnCount, itemWidth };
}
