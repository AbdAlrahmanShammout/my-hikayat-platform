import type { User } from '@/types/user';
import { USER_ROLES } from '@/types/user-role';

/**
 * UX home after login. Backend Roles remain the security authority.
 */
export function getPostLoginPath(role: User['role']): string | null {
  if (role === USER_ROLES.ADMIN) {
    return '/admin';
  }
  if (role === USER_ROLES.AUTHOR) {
    return '/author';
  }
  return null;
}
