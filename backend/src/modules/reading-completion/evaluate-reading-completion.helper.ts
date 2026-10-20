import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { VirtualPage } from '@/modules/reading-completion/build-virtual-pages.helper';
import {
  CHAPTER_IMAGE_PAUSE_SECONDS,
  CHAPTER_PAGE_RATIO,
  CHAPTER_TARGET_WPM,
  MIN_PAGE_STAY_RATIO,
  MIN_TOTAL_TIME_RATIO,
  MS_PER_SECOND,
  PICTURE_IMAGE_PAUSE_SECONDS,
  PICTURE_MIN_PAGE_TIME_MS,
  PICTURE_PAGE_RATIO,
  PICTURE_TARGET_WPM,
  SECONDS_PER_MINUTE,
} from '@/modules/reading-completion/consts/reading-completion.constant';

export type PageDwell = {
  readonly pageIndex: number;
  readonly activeDurationMs: number;
};

export type ReadingCompletionEvaluation = {
  readonly qualifyingPageCount: number;
  readonly activeTimeMs: number;
  readonly lastPageRead: number | null;
  readonly lastPageReached: boolean;
  readonly isCompleted: boolean;
};

/**
 * Target active time for a book, in milliseconds.
 * Picture books add a fixed image pause per page. Chapter books do not.
 */
export function computeTargetTimeMs(input: {
  readonly layoutType: BookLayoutType;
  readonly totalWords: number;
  readonly totalPages: number;
}): number {
  const wordsPerMinute: number =
    input.layoutType === BookLayoutType.FIXED_LAYOUT ? PICTURE_TARGET_WPM : CHAPTER_TARGET_WPM;
  const imagePauseSeconds: number =
    input.layoutType === BookLayoutType.FIXED_LAYOUT
      ? PICTURE_IMAGE_PAUSE_SECONDS
      : CHAPTER_IMAGE_PAUSE_SECONDS;
  const wordsMs: number =
    (input.totalWords / wordsPerMinute) * SECONDS_PER_MINUTE * MS_PER_SECOND;
  const imageMs: number = input.totalPages * imagePauseSeconds * MS_PER_SECOND;
  return wordsMs + imageMs;
}

/**
 * Decides whether a reading cycle is complete from stored page dwells.
 * Time on a page that misses the minimum stay is excluded from the active total.
 */
export function evaluateReadingCompletion(input: {
  readonly layoutType: BookLayoutType;
  readonly totalPages: number;
  readonly totalWords: number;
  readonly pages: readonly PageDwell[];
  readonly virtualPages?: readonly VirtualPage[];
}): ReadingCompletionEvaluation {
  const totalPages: number = Math.max(input.totalPages, 0);
  const qualifying = input.pages.filter((page) =>
    isQualifyingPage({
      layoutType: input.layoutType,
      activeDurationMs: page.activeDurationMs,
      wordCount: resolveWordCount(input.virtualPages, page.pageIndex),
    }),
  );
  const activeTimeMs: number = qualifying.reduce(
    (sum: number, page: PageDwell) => sum + page.activeDurationMs,
    0,
  );
  const visited = input.pages.filter((page) => page.activeDurationMs > 0);
  const lastPageRead: number | null =
    visited.length === 0
      ? null
      : visited.reduce((max: number, page: PageDwell) => Math.max(max, page.pageIndex), 0);
  const lastPageReached: boolean = visited.some((page) => page.pageIndex === totalPages);
  const requiredPages: number =
    totalPages *
    (input.layoutType === BookLayoutType.FIXED_LAYOUT ? PICTURE_PAGE_RATIO : CHAPTER_PAGE_RATIO);
  const targetTimeMs: number = computeTargetTimeMs({
    layoutType: input.layoutType,
    totalWords: input.totalWords,
    totalPages,
  });
  const isCompleted: boolean =
    totalPages > 0 &&
    qualifying.length >= requiredPages &&
    lastPageReached &&
    activeTimeMs >= MIN_TOTAL_TIME_RATIO * targetTimeMs;
  return {
    qualifyingPageCount: qualifying.length,
    activeTimeMs,
    lastPageRead,
    lastPageReached,
    isCompleted,
  };
}

function isQualifyingPage(input: {
  readonly layoutType: BookLayoutType;
  readonly activeDurationMs: number;
  readonly wordCount: number;
}): boolean {
  if (input.layoutType === BookLayoutType.FIXED_LAYOUT) {
    return input.activeDurationMs >= PICTURE_MIN_PAGE_TIME_MS;
  }
  const expectedMs: number =
    (input.wordCount / CHAPTER_TARGET_WPM) * SECONDS_PER_MINUTE * MS_PER_SECOND;
  return input.activeDurationMs >= MIN_PAGE_STAY_RATIO * expectedMs;
}

function resolveWordCount(virtualPages: readonly VirtualPage[] | undefined, pageIndex: number): number {
  if (virtualPages === undefined) {
    return 0;
  }
  const page: VirtualPage | undefined = virtualPages.find((item) => item.pageIndex === pageIndex);
  return page === undefined ? 0 : page.wordCount;
}
