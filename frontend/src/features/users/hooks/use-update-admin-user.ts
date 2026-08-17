import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  updateAdminUser,
  type UpdateAdminUserInput,
} from '@/features/users/api/update-admin-user';
import { invalidateAdminUsersQueries } from '@/features/users/lib/invalidate-admin-users-queries';
import type { components } from '@/generated/admin';

/**
 * PATCH /admin/users/:id mutation.
 */
export function useUpdateAdminUser(): UseMutationResult<
  components['schemas']['UserResponse'],
  Error,
  UpdateAdminUserInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminUser,
    onSuccess: async () => {
      await invalidateAdminUsersQueries(queryClient);
    },
  });
}
