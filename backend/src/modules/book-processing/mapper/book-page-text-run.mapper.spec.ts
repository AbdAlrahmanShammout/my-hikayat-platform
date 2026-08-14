import { BookPageTextRunMapper } from './book-page-text-run.mapper';

describe('BookPageTextRunMapper', () => {
  it('maps a persistence payload to the domain entity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = BookPageTextRunMapper.toEntity({
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
    });
    expect(actualEntity.text).toBe('Harbor');
    expect(actualEntity.x).toBe(120);
    expect(actualEntity.width).toBe(200);
  });
});
