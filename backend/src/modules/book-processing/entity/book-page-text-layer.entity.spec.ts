import { BookPageTextLayerEntity } from './book-page-text-layer.entity';

describe('BookPageTextLayerEntity', () => {
  it('holds searchable text for a fixed-layout page', () => {
    const actualEntity = new BookPageTextLayerEntity({
      id: 51,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      pageId: 21,
      bookId: 8,
      contentText: 'Harbor lights',
    });
    expect(actualEntity.pageId).toBe(21);
    expect(actualEntity.contentText).toBe('Harbor lights');
  });
});
