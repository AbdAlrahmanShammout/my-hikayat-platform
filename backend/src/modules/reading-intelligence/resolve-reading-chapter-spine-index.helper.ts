export function resolveReadingChapterSpineIndex(
  payloadSpineIndex: number | null | undefined,
  sessionSpineIndex: number | null,
): number | null {
  const candidate: number | null | undefined = payloadSpineIndex ?? sessionSpineIndex;
  if (candidate === null || candidate === undefined) {
    return null;
  }
  if (!Number.isInteger(candidate) || candidate < 0) {
    return null;
  }
  return candidate;
}
