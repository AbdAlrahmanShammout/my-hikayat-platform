import { ADMIN_USER_LIST_TABS, type AdminUserListTab } from '@/features/users/lib/admin-user-list-tab';
import type { UserRole } from '@/types/user-role';
import { USER_ROLES } from '@/types/user-role';

export type AdminUsersListQueryFilters = {
  readonly role: UserRole | undefined;
  readonly isPublisher: boolean | undefined;
};

/**
 * Maps a users-list tab onto GET /admin/users filters.
 * Publisher is isPublisher, including admins who can own books.
 */
export function resolveAdminUsersListQuery(tab: AdminUserListTab): AdminUsersListQueryFilters {
  if (tab === ADMIN_USER_LIST_TABS.ADMIN) {
    return { role: USER_ROLES.ADMIN, isPublisher: undefined };
  }
  if (tab === ADMIN_USER_LIST_TABS.READER) {
    return { role: USER_ROLES.READER, isPublisher: undefined };
  }
  if (tab === ADMIN_USER_LIST_TABS.PUBLISHER) {
    return { role: undefined, isPublisher: true };
  }
  return { role: undefined, isPublisher: undefined };
}
