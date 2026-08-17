import type { User } from '@/types/user';
import { USER_ROLES } from '@/types/user-role';

/**
 * UX gate matching author HTTP Roles(AUTHOR, ADMIN). Not a security check.
 */
export function canAccessAuthorDashboard(role: User['role']): boolean {
  return role === USER_ROLES.AUTHOR || role === USER_ROLES.ADMIN;
}
