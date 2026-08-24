/**
 * Computes aspect-fit canvas size for a fixed-layout spread inside available bounds.
 */
export function computeAspectFitSize(input: {
  readonly contentWidth: number;
  readonly contentHeight: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly zoom: number;
}): { readonly width: number; readonly height: number } {
  const contentWidth: number = Math.max(1, input.contentWidth);
  const contentHeight: number = Math.max(1, input.contentHeight);
  const viewportWidth: number = Math.max(1, input.viewportWidth);
  const viewportHeight: number = Math.max(1, input.viewportHeight);
  const zoom: number = Math.min(4, Math.max(1, input.zoom));
  const fitScale: number = Math.min(
    viewportWidth / contentWidth,
    viewportHeight / contentHeight,
  );
  const scale: number = fitScale * zoom;
  return {
    width: Math.max(1, Math.round(contentWidth * scale)),
    height: Math.max(1, Math.round(contentHeight * scale)),
  };
}

/**
 * Resolves spread content pixel size from one or two pages.
 */
export function resolveSpreadContentSize(input: {
  readonly leftWidth: number | null;
  readonly leftHeight: number | null;
  readonly rightWidth: number | null;
  readonly rightHeight: number | null;
  readonly centerWidth: number | null;
  readonly centerHeight: number | null;
}): { readonly width: number; readonly height: number } {
  if (input.centerWidth !== null && input.centerHeight !== null) {
    return {
      width: Math.max(1, input.centerWidth),
      height: Math.max(1, input.centerHeight),
    };
  }
  const leftWidth: number = input.leftWidth ?? 0;
  const rightWidth: number = input.rightWidth ?? 0;
  const leftHeight: number = input.leftHeight ?? 0;
  const rightHeight: number = input.rightHeight ?? 0;
  return {
    width: Math.max(1, leftWidth + rightWidth),
    height: Math.max(1, Math.max(leftHeight, rightHeight)),
  };
}
