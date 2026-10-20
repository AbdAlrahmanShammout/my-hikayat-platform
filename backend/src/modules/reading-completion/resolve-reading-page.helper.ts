import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ChapterWordSpan } from '@/modules/reading-completion/book-reading-structure';
import { DEFAULT_WORDS_PER_PAGE } from '@/modules/reading-completion/consts/reading-completion.constant';

export type ResolvedReadingPage = {
  readonly pageIndex: number;
  readonly totalPages: number;
  readonly totalWords: number;
};

/**
 * Resolves the 1-based page a dwell belongs to.
 * Fixed-layout uses the reported page number. Reflowable books use virtual pages.
 */
export function resolveReadingPage(input: {
  readonly layoutType: BookLayoutType;
  readonly pageNumber?: number;
  readonly spineIndex?: number;
  readonly scrollOffset?: number;
  readonly contentHeight?: number;
  readonly fixedPageCount: number;
  readonly chapters: readonly ChapterWordSpan[];
  readonly wordsPerPage?: number;
}): ResolvedReadingPage | null {
  if (input.layoutType === BookLayoutType.FIXED_LAYOUT) {
    return resolveFixedPage(input.pageNumber, input.fixedPageCount);
  }
  return resolveReflowablePage(input);
}

function resolveFixedPage(
  pageNumber: number | undefined,
  fixedPageCount: number,
): ResolvedReadingPage | null {
  if (pageNumber === undefined || fixedPageCount <= 0 || pageNumber < 1 || pageNumber > fixedPageCount) {
    return null;
  }
  return { pageIndex: pageNumber, totalPages: fixedPageCount, totalWords: 0 };
}

function resolveReflowablePage(input: {
  readonly spineIndex?: number;
  readonly scrollOffset?: number;
  readonly contentHeight?: number;
  readonly chapters: readonly ChapterWordSpan[];
  readonly wordsPerPage?: number;
}): ResolvedReadingPage | null {
  if (input.chapters.length === 0) {
    return null;
  }
  const wordsPerPage: number = resolveWordsPerPage(input.wordsPerPage);
  const ordered = [...input.chapters].sort(
    (left, right) => left.spineIndex - right.spineIndex,
  );
  const totalWords: number = ordered.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const totalPages: number = Math.max(1, Math.ceil(totalWords / wordsPerPage));
  const spineIndex: number = input.spineIndex ?? ordered[0].spineIndex;
  const chapter = ordered.find((item) => item.spineIndex === spineIndex) ?? ordered[0];
  const wordsBefore: number = ordered
    .filter((item) => item.spineIndex < chapter.spineIndex)
    .reduce((sum, item) => sum + item.wordCount, 0);
  const progress: number = resolveChapterProgress(input.scrollOffset, input.contentHeight);
  const wordsIntoChapter: number = Math.min(chapter.wordCount, chapter.wordCount * progress);
  const absoluteWords: number = wordsBefore + wordsIntoChapter;
  if (totalWords <= 0) {
    return { pageIndex: 1, totalPages: 1, totalWords: 0 };
  }
  if (absoluteWords >= totalWords) {
    return { pageIndex: totalPages, totalPages, totalWords };
  }
  const pageIndex: number = Math.min(
    totalPages,
    Math.floor(absoluteWords / wordsPerPage) + 1,
  );
  return { pageIndex, totalPages, totalWords };
}

function resolveWordsPerPage(wordsPerPage: number | undefined): number {
  if (wordsPerPage === undefined || !Number.isInteger(wordsPerPage) || wordsPerPage < 1) {
    return DEFAULT_WORDS_PER_PAGE;
  }
  return wordsPerPage;
}

function resolveChapterProgress(scrollOffset: number | undefined, contentHeight: number | undefined): number {
  if (
    scrollOffset === undefined ||
    contentHeight === undefined ||
    contentHeight <= 0 ||
    scrollOffset <= 0
  ) {
    return 0;
  }
  return Math.min(1, scrollOffset / contentHeight);
}
