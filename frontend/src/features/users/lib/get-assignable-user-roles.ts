import type { UserRole } from '@/types/user-role';
import { USER_ROLES } from '@/types/user-role';

/**
 * Roles the user-edit form may offer. Granting ADMIN requires an invitation.
 */
export function getAssignableUserRoles(currentRole: UserRole): readonly UserRole[] {
  if (currentRole === USER_ROLES.ADMIN) {
    return [USER_ROLES.READER, USER_ROLES.AUTHOR, USER_ROLES.ADMIN];
  }
  return [USER_ROLES.READER, USER_ROLES.AUTHOR];
}
