import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles', () => {
  it('exports a stable metadata key', () => {
    expect(ROLES_KEY).toBe('roles');
    expect(Roles('admin', 'author').KEY).toBe(ROLES_KEY);
  });
});
