import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';

import { BookPageEntity } from './book-page.entity';

describe('BookPageEntity', () => {
  it('holds a persisted fixed-layout page', () => {
    const actualEntity = new BookPageEntity({
      id: 21,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      bookId: 8,
      spineIndex: 0,
      href: 'OEBPS/page1.xhtml',
      manifestId: 'p1',
      title: 'Cover',
      width: 1200,
      height: 1600,
      spreadRole: BookPageSpreadRole.LEFT,
    });
    expect(actualEntity.width).toBe(1200);
    expect(actualEntity.height).toBe(1600);
    expect(actualEntity.spreadRole).toBe(BookPageSpreadRole.LEFT);
  });
});
