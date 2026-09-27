import {
  ADMIN_USER_LIST_TABS,
  type AdminUserListTab,
} from '@/features/users/lib/admin-user-list-tab';
import { parseExactEmail } from '@/lib/parse-exact-email';
import { parseNonNegativeInt } from '@/lib/parse-non-negative-int';
import { USER_ROLES } from '@/types/user-role';

export type AdminUsersListSearch = {
  readonly tab: AdminUserListTab;
  readonly email: string | undefined;
  readonly offset: number;
};

/**
 * Reads list filters from the URL. Invalid tab or email values are ignored.
 * Older role and isPublisher params still select the matching tab.
 */
export function parseAdminUsersListSearch(searchParams: URLSearchParams): AdminUsersListSearch {
  return {
    tab: parseTab(searchParams),
    email: parseExactEmail(searchParams.get('email') ?? undefined),
    offset: parseNonNegativeInt(searchParams.get('offset') ?? undefined) ?? 0,
  };
}

function parseTab(searchParams: URLSearchParams): AdminUserListTab {
  const explicitTab: AdminUserListTab | undefined = parseTabValue(searchParams.get('tab') ?? undefined);
  if (explicitTab !== undefined) {
    return explicitTab;
  }
  return parseLegacyTab(searchParams.get('role') ?? undefined, searchParams.get('isPublisher') ?? undefined);
}

function parseTabValue(value: string | undefined): AdminUserListTab | undefined {
  if (
    value === ADMIN_USER_LIST_TABS.ALL ||
    value === ADMIN_USER_LIST_TABS.ADMIN ||
    value === ADMIN_USER_LIST_TABS.READER ||
    value === ADMIN_USER_LIST_TABS.PUBLISHER
  ) {
    return value;
  }
  return undefined;
}

function parseLegacyTab(role: string | undefined, isPublisher: string | undefined): AdminUserListTab {
  if (role === USER_ROLES.ADMIN) {
    return ADMIN_USER_LIST_TABS.ADMIN;
  }
  if (role === USER_ROLES.READER) {
    return ADMIN_USER_LIST_TABS.READER;
  }
  if (isPublisher === 'true' || role === USER_ROLES.AUTHOR) {
    return ADMIN_USER_LIST_TABS.PUBLISHER;
  }
  return ADMIN_USER_LIST_TABS.ALL;
}
