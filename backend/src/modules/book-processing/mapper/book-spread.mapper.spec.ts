import { BookSpreadMapper } from './book-spread.mapper';

describe('BookSpreadMapper', () => {
  it('maps a persistence payload to the domain entity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = BookSpreadMapper.toEntity({
      id: 31,
      createdAt,
      updatedAt,
      deletedAt: null,
      bookId: 8,
      spreadIndex: 0,
      leftPageId: 21,
      rightPageId: 22,
      centerPageId: null,
    });
    expect(actualEntity.leftPageId).toBe(21);
    expect(actualEntity.rightPageId).toBe(22);
    expect(actualEntity.centerPageId).toBeNull();
  });
});
