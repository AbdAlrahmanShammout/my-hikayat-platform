import type { UserRole } from '@/types/user-role';
import { USER_ROLES } from '@/types/user-role';

const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.READER]: 'Reader',
  [USER_ROLES.AUTHOR]: 'Author',
  [USER_ROLES.ADMIN]: 'Admin',
};

/**
 * Presents a backend role value without changing its meaning.
 */
export function formatUserRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}
