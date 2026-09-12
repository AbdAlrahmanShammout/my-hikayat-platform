import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';
import { ReadingProgressPresentation } from '@/modules/reading/defs/reading-progress-presentation.defs';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { resolveFixedLayoutProgressPercent } from '@/modules/reading/resolve-fixed-layout-progress.helper';
import { resolveReadingLocationLabel } from '@/modules/reading/resolve-reading-location-label.helper';
import { resolveReflowableContentProgressPercent } from '@/modules/reading/resolve-reflowable-content-progress.helper';

type ResolveReadingProgressPresentationInput = {
  readonly progress: ReadingProgressEntity;
  readonly chapters: readonly BookChapterEntity[];
  readonly pages: readonly BookPageEntity[];
  readonly spreads: readonly BookSpreadEntity[];
};

/**
 * Builds the reader-facing content percent and location label from processed book structure.
 */
export function resolveReadingProgressPresentation(
  input: ResolveReadingProgressPresentationInput,
): ReadingProgressPresentation {
  const matchingChapter: BookChapterEntity | undefined = input.chapters.find(
    (chapter) => chapter.spineIndex === input.progress.spineIndex,
  );
  return {
    contentProgressPercent: resolveContentProgressPercent(input),
    locationLabel: resolveReadingLocationLabel({
      layoutType: input.progress.layoutType,
      spineIndex: input.progress.spineIndex,
      chapterTitle: matchingChapter?.title ?? null,
      pageNumber: input.progress.pageNumber,
      pageCount: input.pages.length,
      spreadIndex: input.progress.spreadIndex,
      spreadCount: input.spreads.length,
    }),
  };
}

function resolveContentProgressPercent(
  input: ResolveReadingProgressPresentationInput,
): number {
  if (input.progress.layoutType === BookLayoutType.REFLOWABLE) {
    return resolveReflowableContentProgressPercent({
      spineIndex: input.progress.spineIndex,
      chapters: input.chapters,
    });
  }
  return resolveFixedLayoutProgressPercent({
    pageNumber: input.progress.pageNumber,
    pageCount: input.pages.length,
    spreadIndex: input.progress.spreadIndex,
    spreadCount: input.spreads.length,
  });
}
