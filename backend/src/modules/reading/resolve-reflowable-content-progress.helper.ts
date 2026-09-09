type ReflowableChapterProgressInput = {
  readonly spineIndex: number;
  readonly contentText: string;
};

type ResolveReflowableContentProgressInput = {
  readonly spineIndex: number | null;
  readonly chapters: readonly ReflowableChapterProgressInput[];
};

/**
 * Maps a reflowable spine location to a content-based progress percent (0–100).
 * Uses stored chapter text length, not pageNumber or rendered page count.
 */
export function resolveReflowableContentProgressPercent(
  input: ResolveReflowableContentProgressInput,
): number {
  const orderedChapters: ReflowableChapterProgressInput[] = [...input.chapters].sort(
    (left, right) => left.spineIndex - right.spineIndex,
  );
  const chapterCount: number = orderedChapters.length;
  if (chapterCount === 0 || input.spineIndex === null) {
    return 0;
  }
  const clampedSpineIndex: number = clampSpineIndex(input.spineIndex, chapterCount);
  const lengths: number[] = orderedChapters.map((chapter) => chapter.contentText.trim().length);
  const totalLength: number = lengths.reduce((sum: number, length: number) => sum + length, 0);
  if (totalLength === 0) {
    return Math.floor((clampedSpineIndex / chapterCount) * 100);
  }
  const completedLength: number = lengths
    .slice(0, clampedSpineIndex)
    .reduce((sum: number, length: number) => sum + length, 0);
  return Math.min(100, Math.floor((completedLength / totalLength) * 100));
}

function clampSpineIndex(spineIndex: number, chapterCount: number): number {
  if (!Number.isInteger(spineIndex) || spineIndex < 0) {
    return 0;
  }
  if (spineIndex >= chapterCount) {
    return chapterCount - 1;
  }
  return spineIndex;
}
