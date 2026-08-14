import { Principal } from './principal.interface';

describe('Principal', () => {
  it('describes the authenticated caller by id and role only', () => {
    const actualPrincipal: Principal = { id: 3, role: 'reader' };
    expect(actualPrincipal.id).toBe(3);
    expect(actualPrincipal.role).toBe('reader');
    expect(actualPrincipal).not.toHaveProperty('email');
  });
});
