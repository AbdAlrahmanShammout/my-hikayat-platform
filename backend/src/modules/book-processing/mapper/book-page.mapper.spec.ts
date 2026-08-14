import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';

import { BookPageMapper } from './book-page.mapper';

describe('BookPageMapper', () => {
  it('maps a persistence payload to the domain entity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = BookPageMapper.toEntity({
      id: 21,
      createdAt,
      updatedAt,
      deletedAt: null,
      bookId: 8,
      spineIndex: 0,
      href: 'OEBPS/page1.xhtml',
      manifestId: 'p1',
      title: 'Cover',
      width: 1200,
      height: 1600,
      spreadRole: 'left',
    });
    expect(actualEntity.width).toBe(1200);
    expect(actualEntity.spreadRole).toBe(BookPageSpreadRole.LEFT);
  });
});
