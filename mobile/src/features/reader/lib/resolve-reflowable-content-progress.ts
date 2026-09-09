type ResolveReflowableContentProgressInput = {
  readonly spineIndex: number;
  readonly chapters: ReadonlyArray<{ readonly htmlDocument: string }>;
};

/**
 * Maps a reflowable spine location to a content-based progress percent (0–100).
 * Uses chapter text length, not rendered page count or scroll pixels.
 */
export function resolveReflowableContentProgress(
  input: ResolveReflowableContentProgressInput,
): number {
  const chapterCount: number = input.chapters.length;
  if (chapterCount === 0) {
    return 0;
  }
  const clampedSpineIndex: number = clampSpineIndex(input.spineIndex, chapterCount);
  const lengths: number[] = input.chapters.map((chapter) =>
    measureReflowableChapterContentLength(chapter.htmlDocument),
  );
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

function measureReflowableChapterContentLength(htmlDocument: string): number {
  const withoutScripts: string = htmlDocument.replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
  const withoutStyles: string = withoutScripts.replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const withoutTags: string = withoutStyles.replace(/<[^>]+>/g, ' ');
  return withoutTags.replace(/\s+/g, ' ').trim().length;
}
