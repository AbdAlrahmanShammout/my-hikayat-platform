import type { UserRole } from '@/types/user-role';
import { USER_ROLES } from '@/types/user-role';

/**
 * Aligns isPublisher with role the way PATCH /admin/users/:id will persist it.
 */
export function resolvePublisherForRole(role: UserRole, currentIsPublisher: boolean): boolean {
  if (role === USER_ROLES.READER) {
    return false;
  }
  if (role === USER_ROLES.AUTHOR) {
    return true;
  }
  return currentIsPublisher;
}
