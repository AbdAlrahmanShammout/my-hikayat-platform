import { BookChapterEntity } from './book-chapter.entity';

describe('BookChapterEntity', () => {
  it('holds a persisted reflowable spine chapter', () => {
    const actualEntity = new BookChapterEntity({
      id: 11,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      bookId: 8,
      spineIndex: 0,
      href: 'OEBPS/chapter1.xhtml',
      manifestId: 'c1',
      title: 'The Harbor',
      contentText: 'First chapter text.',
    });
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.spineIndex).toBe(0);
    expect(actualEntity.title).toBe('The Harbor');
    expect(actualEntity.contentText).toBe('First chapter text.');
  });
});
