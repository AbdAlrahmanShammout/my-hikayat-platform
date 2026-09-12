import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';

import { resolveReadingProgressPresentation } from './resolve-reading-progress-presentation.helper';

describe('resolveReadingProgressPresentation', () => {
  it('uses chapter text length and title for reflowable progress', () => {
    const inputProgress = createProgress({
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 1,
    });
    const actualPresentation = resolveReadingProgressPresentation({
      progress: inputProgress,
      chapters: [
        createChapter({ spineIndex: 0, title: 'Dawn', contentText: 'aa' }),
        createChapter({ spineIndex: 1, title: 'Harbor', contentText: 'bbbb' }),
      ],
      pages: [],
      spreads: [],
    });
    expect(actualPresentation.contentProgressPercent).toBe(33);
    expect(actualPresentation.locationLabel).toBe('Harbor');
  });

  it('uses page counts for fixed-layout progress', () => {
    const inputProgress = createProgress({
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: 0,
      pageNumber: 2,
    });
    const actualPresentation = resolveReadingProgressPresentation({
      progress: inputProgress,
      chapters: [],
      pages: [createPage(0), createPage(1), createPage(2), createPage(3)],
      spreads: [createSpread(0), createSpread(1)],
    });
    expect(actualPresentation.contentProgressPercent).toBe(50);
    expect(actualPresentation.locationLabel).toBe('Page 2 of 4');
  });
});

function createProgress(
  overrides: Partial<ConstructorParameters<typeof ReadingProgressEntity>[0]>,
): ReadingProgressEntity {
  return new ReadingProgressEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    spineIndex: 0,
    scrollOffset: 0,
    spreadIndex: null,
    pageNumber: null,
    lastSessionAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });
}

function createChapter(input: {
  readonly spineIndex: number;
  readonly title: string;
  readonly contentText: string;
}): BookChapterEntity {
  return new BookChapterEntity({
    id: input.spineIndex + 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    spineIndex: input.spineIndex,
    href: `chapter-${input.spineIndex}.xhtml`,
    manifestId: `ch-${input.spineIndex}`,
    title: input.title,
    contentText: input.contentText,
  });
}

function createPage(spineIndex: number): BookPageEntity {
  return new BookPageEntity({
    id: spineIndex + 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    spineIndex,
    href: `page-${spineIndex}.xhtml`,
    manifestId: `page-${spineIndex}`,
    title: `Page ${spineIndex + 1}`,
    width: 800,
    height: 1200,
    spreadRole: BookPageSpreadRole.LEFT,
  });
}

function createSpread(spreadIndex: number): BookSpreadEntity {
  return new BookSpreadEntity({
    id: spreadIndex + 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    spreadIndex,
    leftPageId: spreadIndex * 2 + 1,
    rightPageId: spreadIndex * 2 + 2,
    centerPageId: null,
  });
}
