import { describe, expect, it } from 'vitest';

import { parseAdminInvitationsListSearch } from '@/features/invitations/lib/parse-admin-invitations-list-search';

describe('parseAdminInvitationsListSearch', () => {
  it('defaults to offset 0', () => {
    const actualSearch = parseAdminInvitationsListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({ offset: 0 });
  });

  it('reads a valid offset', () => {
    const actualSearch = parseAdminInvitationsListSearch(new URLSearchParams('offset=20'));
    expect(actualSearch).toEqual({ offset: 20 });
  });
});
