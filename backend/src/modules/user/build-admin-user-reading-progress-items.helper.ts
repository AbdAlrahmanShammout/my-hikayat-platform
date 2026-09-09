import { BookCatalogCover } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';
import { BookActiveDurationTotal } from '@/modules/reading/defs/reading-session-repository.defs';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { resolveFixedLayoutProgressPercent } from '@/modules/reading/resolve-fixed-layout-progress.helper';
import { resolveReadingLocationLabel } from '@/modules/reading/resolve-reading-location-label.helper';
import { resolveReflowableContentProgressPercent } from '@/modules/reading/resolve-reflowable-content-progress.helper';
import { AdminUserReadingProgressItem } from '@/modules/user/defs/user-admin-detail-service.defs';

type BuildAdminUserReadingProgressItemsInput = {
  readonly progressRows: readonly ReadingProgressEntity[];
  readonly books: readonly BookEntity[];
  readonly coverByBookId: ReadonlyMap<number, BookCatalogCover | null>;
  readonly chapters: readonly BookChapterEntity[];
  readonly pages: readonly BookPageEntity[];
  readonly spreads: readonly BookSpreadEntity[];
  readonly durationTotals: readonly BookActiveDurationTotal[];
};

/**
 * Assembles admin reading-progress rows from batched book, structure, and session data.
 */
export function buildAdminUserReadingProgressItems(
  input: BuildAdminUserReadingProgressItemsInput,
): AdminUserReadingProgressItem[] {
  const bookById: ReadonlyMap<number, BookEntity> = toEntityById(input.books);
  const durationByBookId: ReadonlyMap<number, number> = toDurationByBookId(input.durationTotals);
  const chaptersByBookId: ReadonlyMap<number, BookChapterEntity[]> = groupByBookId(input.chapters);
  const pagesByBookId: ReadonlyMap<number, BookPageEntity[]> = groupByBookId(input.pages);
  const spreadsByBookId: ReadonlyMap<number, BookSpreadEntity[]> = groupByBookId(input.spreads);
  const items: AdminUserReadingProgressItem[] = [];
  for (const progress of input.progressRows) {
    const book: BookEntity | undefined = bookById.get(progress.bookId);
    if (book === undefined) {
      continue;
    }
    items.push(
      toReadingItem({
        progress,
        book,
        cover: input.coverByBookId.get(book.id) ?? null,
        chapters: chaptersByBookId.get(book.id) ?? [],
        pages: pagesByBookId.get(book.id) ?? [],
        spreads: spreadsByBookId.get(book.id) ?? [],
        activeDurationMs: durationByBookId.get(book.id) ?? 0,
      }),
    );
  }
  return items;
}

function toReadingItem(input: {
  readonly progress: ReadingProgressEntity;
  readonly book: BookEntity;
  readonly cover: BookCatalogCover | null;
  readonly chapters: readonly BookChapterEntity[];
  readonly pages: readonly BookPageEntity[];
  readonly spreads: readonly BookSpreadEntity[];
  readonly activeDurationMs: number;
}): AdminUserReadingProgressItem {
  return {
    book: input.book,
    cover: input.cover,
    layoutType: input.progress.layoutType,
    contentProgressPercent: resolveContentProgressPercent(input),
    locationLabel: resolveLocationLabel(input),
    spineIndex: input.progress.spineIndex,
    scrollOffset: input.progress.scrollOffset,
    spreadIndex: input.progress.spreadIndex,
    pageNumber: input.progress.pageNumber,
    activeDurationMs: input.activeDurationMs,
    lastSessionAt: input.progress.lastSessionAt,
  };
}

function resolveContentProgressPercent(input: {
  readonly progress: ReadingProgressEntity;
  readonly chapters: readonly BookChapterEntity[];
  readonly pages: readonly BookPageEntity[];
  readonly spreads: readonly BookSpreadEntity[];
}): number {
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

function resolveLocationLabel(input: {
  readonly progress: ReadingProgressEntity;
  readonly chapters: readonly BookChapterEntity[];
  readonly pages: readonly BookPageEntity[];
  readonly spreads: readonly BookSpreadEntity[];
}): string | null {
  const matchingChapter: BookChapterEntity | undefined = input.chapters.find(
    (chapter) => chapter.spineIndex === input.progress.spineIndex,
  );
  return resolveReadingLocationLabel({
    layoutType: input.progress.layoutType,
    spineIndex: input.progress.spineIndex,
    chapterTitle: matchingChapter?.title ?? null,
    pageNumber: input.progress.pageNumber,
    pageCount: input.pages.length,
    spreadIndex: input.progress.spreadIndex,
    spreadCount: input.spreads.length,
  });
}

function toEntityById(books: readonly BookEntity[]): ReadonlyMap<number, BookEntity> {
  return new Map(books.map((book) => [book.id, book]));
}

function toDurationByBookId(
  totals: readonly BookActiveDurationTotal[],
): ReadonlyMap<number, number> {
  return new Map(totals.map((total) => [total.bookId, total.activeDurationMs]));
}

function groupByBookId<T extends { bookId: number }>(
  items: readonly T[],
): ReadonlyMap<number, T[]> {
  const grouped = new Map<number, T[]>();
  for (const item of items) {
    const bucket: T[] = grouped.get(item.bookId) ?? [];
    bucket.push(item);
    grouped.set(item.bookId, bucket);
  }
  return grouped;
}
