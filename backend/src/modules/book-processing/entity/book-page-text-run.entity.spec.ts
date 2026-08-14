import { BookPageTextRunEntity } from './book-page-text-run.entity';

describe('BookPageTextRunEntity', () => {
  it('holds a positioned searchable text run', () => {
    const actualEntity = new BookPageTextRunEntity({
      id: 41,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
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
    expect(actualEntity.y).toBe(80);
  });
});
