import type { UserRole } from '@/types/user-role';
import { USER_ROLES } from '@/types/user-role';

const USER_SELF_MANAGEMENT_MESSAGE =
  'An admin cannot change their own account through user management';
const USER_LAST_ADMIN_MESSAGE = 'The last remaining admin cannot be demoted or deleted';

export type AdminUserActionAvailability = {
  readonly canUpdate: boolean;
  readonly updateDisabledReason: string | null;
  readonly canDelete: boolean;
  readonly deleteDisabledReason: string | null;
  readonly canLeaveAdminRole: boolean;
};

type AdminUserActionInput = {
  readonly targetUserId: number;
  readonly targetRole: UserRole;
  readonly actorUserId: number | undefined;
  readonly adminTotal: number | undefined;
};

/**
 * UX hints from displayed user fields. Backend still enforces the real rules.
 */
export function getAdminUserActionAvailability(
  input: AdminUserActionInput,
): AdminUserActionAvailability {
  if (input.actorUserId === undefined) {
    return {
      canUpdate: false,
      updateDisabledReason: 'Confirming the signed-in admin…',
      canDelete: false,
      deleteDisabledReason: 'Confirming the signed-in admin…',
      canLeaveAdminRole: false,
    };
  }
  if (input.actorUserId === input.targetUserId) {
    return {
      canUpdate: false,
      updateDisabledReason: USER_SELF_MANAGEMENT_MESSAGE,
      canDelete: false,
      deleteDisabledReason: USER_SELF_MANAGEMENT_MESSAGE,
      canLeaveAdminRole: false,
    };
  }
  const isLastAdmin: boolean =
    input.targetRole === USER_ROLES.ADMIN && input.adminTotal === 1;
  return {
    canUpdate: true,
    updateDisabledReason: null,
    canDelete: !isLastAdmin,
    deleteDisabledReason: isLastAdmin ? USER_LAST_ADMIN_MESSAGE : null,
    canLeaveAdminRole: !isLastAdmin,
  };
}
