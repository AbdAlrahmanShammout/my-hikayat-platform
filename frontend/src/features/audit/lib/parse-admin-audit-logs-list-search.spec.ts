import { describe, expect, it } from 'vitest';

import { parseAdminAuditLogsListSearch } from '@/features/audit/lib/parse-admin-audit-logs-list-search';

describe('parseAdminAuditLogsListSearch', () => {
  it('defaults to unfiltered offset 0', () => {
    const actualSearch = parseAdminAuditLogsListSearch(new URLSearchParams());
    expect(actualSearch).toEqual({
      actorUserId: undefined,
      action: undefined,
      subjectType: undefined,
      subjectId: undefined,
      offset: 0,
    });
  });

  it('reads actor, action, subject, and offset', () => {
    const actualSearch = parseAdminAuditLogsListSearch(
      new URLSearchParams(
        'actorUserId=9&action=revenue_calculated&subjectType=revenue_period&subjectId=4&offset=20',
      ),
    );
    expect(actualSearch).toEqual({
      actorUserId: 9,
      action: 'revenue_calculated',
      subjectType: 'revenue_period',
      subjectId: 4,
      offset: 20,
    });
  });

  it('ignores unknown action and subjectType values', () => {
    const actualSearch = parseAdminAuditLogsListSearch(
      new URLSearchParams('action=category_weight_changed&subjectType=category'),
    );
    expect(actualSearch.action).toBeUndefined();
    expect(actualSearch.subjectType).toBeUndefined();
  });
});
