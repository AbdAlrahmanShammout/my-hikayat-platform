import { BookPageSpreadRole } from './general.enum';

describe('Book processing enums', () => {
  it('mirrors the database page spread role literals', () => {
    expect(BookPageSpreadRole.LEFT).toBe('left');
    expect(BookPageSpreadRole.RIGHT).toBe('right');
    expect(BookPageSpreadRole.CENTER).toBe('center');
    expect(BookPageSpreadRole.SINGLE).toBe('single');
  });
});
