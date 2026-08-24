import {
  computeAspectFitSize,
  resolveSpreadContentSize,
} from '@/features/reader/lib/compute-aspect-fit-size';

describe('computeAspectFitSize', () => {
  it('letterboxes a tall page into a wide viewport', () => {
    const actual = computeAspectFitSize({
      contentWidth: 1000,
      contentHeight: 2000,
      viewportWidth: 400,
      viewportHeight: 400,
      zoom: 1,
    });
    expect(actual.width).toBe(200);
    expect(actual.height).toBe(400);
  });

  it('applies zoom after aspect fit', () => {
    const actual = computeAspectFitSize({
      contentWidth: 1000,
      contentHeight: 1000,
      viewportWidth: 200,
      viewportHeight: 200,
      zoom: 2,
    });
    expect(actual.width).toBe(400);
    expect(actual.height).toBe(400);
  });
});

describe('resolveSpreadContentSize', () => {
  it('sums left and right page widths', () => {
    const actual = resolveSpreadContentSize({
      leftWidth: 800,
      leftHeight: 1200,
      rightWidth: 800,
      rightHeight: 1100,
      centerWidth: null,
      centerHeight: null,
    });
    expect(actual).toEqual({ width: 1600, height: 1200 });
  });
});
