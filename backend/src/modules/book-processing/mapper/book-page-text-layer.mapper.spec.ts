import { BookPageTextLayerMapper } from './book-page-text-layer.mapper';

describe('BookPageTextLayerMapper', () => {
  it('maps a persistence payload and its text runs', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = BookPageTextLayerMapper.toEntity({
      id: 51,
      createdAt,
      updatedAt,
      deletedAt: null,
      pageId: 21,
      bookId: 8,
      contentText: 'Harbor lights',
      runs: [
        {
          id: 41,
          createdAt,
          updatedAt,
          deletedAt: null,
          textLayerId: 51,
          sortOrder: 0,
          text: 'Harbor',
          x: 120,
          y: 80,
          width: 200,
          height: 24,
        },
      ],
    });
    expect(actualEntity.contentText).toBe('Harbor lights');
    expect(actualEntity.runs?.[0]?.text).toBe('Harbor');
    expect(actualEntity.runs?.[0]?.x).toBe(120);
  });
});
