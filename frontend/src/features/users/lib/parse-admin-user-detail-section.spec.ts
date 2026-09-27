import { describe, expect, it } from 'vitest';

import { parseAdminUserDetailSection } from '@/features/users/lib/parse-admin-user-detail-section';

describe('parseAdminUserDetailSection', () => {
  it('defaults to the profile section', () => {
    expect(parseAdminUserDetailSection(null)).toBe('profile');
  });

  it('reads the books section', () => {
    expect(parseAdminUserDetailSection('books')).toBe('books');
  });

  it('ignores an unknown section', () => {
    expect(parseAdminUserDetailSection('admin')).toBe('profile');
  });
});
