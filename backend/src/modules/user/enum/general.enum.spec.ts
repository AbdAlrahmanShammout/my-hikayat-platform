import { UserRole } from './general.enum';

describe('UserRole', () => {
  it('mirrors the database role literals', () => {
    expect(UserRole.READER).toBe('reader');
    expect(UserRole.AUTHOR).toBe('author');
    expect(UserRole.ADMIN).toBe('admin');
  });
});
