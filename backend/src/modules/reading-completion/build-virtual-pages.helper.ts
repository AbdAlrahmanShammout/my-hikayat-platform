import { DEFAULT_WORDS_PER_PAGE } from '@/modules/reading-completion/consts/reading-completion.constant';

export type VirtualPage = {
  readonly pageIndex: number;
  readonly wordCount: number;
};

/**
 * Splits a reflowable book into virtual pages of `wordsPerPage` words.
 * The last page keeps the remainder.
 */
export function buildVirtualPages(
  totalWords: number,
  wordsPerPage: number = DEFAULT_WORDS_PER_PAGE,
): VirtualPage[] {
  if (totalWords <= 0 || wordsPerPage <= 0) {
    return [{ pageIndex: 1, wordCount: Math.max(0, totalWords) }];
  }
  const pageCount: number = Math.ceil(totalWords / wordsPerPage);
  const pages: VirtualPage[] = [];
  let remainingWords: number = totalWords;
  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    const wordCount: number =
      pageIndex === pageCount ? remainingWords : Math.min(wordsPerPage, remainingWords);
    pages.push({ pageIndex, wordCount });
    remainingWords -= wordCount;
  }
  return pages;
}
