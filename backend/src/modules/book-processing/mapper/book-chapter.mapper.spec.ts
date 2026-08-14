import { BookChapterMapper } from './book-chapter.mapper';

describe('BookChapterMapper', () => {
  it('maps a persistence payload to the domain entity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = BookChapterMapper.toEntity({
      id: 11,
      createdAt,
      updatedAt,
      deletedAt: null,
      bookId: 8,
      spineIndex: 0,
      href: 'OEBPS/chapter1.xhtml',
      manifestId: 'c1',
      title: 'The Harbor',
      contentText: 'First chapter text.',
    });
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.spineIndex).toBe(0);
    expect(actualEntity.href).toBe('OEBPS/chapter1.xhtml');
    expect(actualEntity.title).toBe('The Harbor');
  });
});
