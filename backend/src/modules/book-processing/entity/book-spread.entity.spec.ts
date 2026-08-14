import { BookSpreadEntity } from './book-spread.entity';

describe('BookSpreadEntity', () => {
  it('holds a persisted facing-page spread', () => {
    const actualEntity = new BookSpreadEntity({
      id: 31,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      bookId: 8,
      spreadIndex: 0,
      leftPageId: 21,
      rightPageId: 22,
      centerPageId: null,
    });
    expect(actualEntity.spreadIndex).toBe(0);
    expect(actualEntity.leftPageId).toBe(21);
    expect(actualEntity.rightPageId).toBe(22);
    expect(actualEntity.centerPageId).toBeNull();
  });
});
