import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { deleteAdminUser } from '@/features/users/api/delete-admin-user';
import { invalidateAdminUsersQueries } from '@/features/users/lib/invalidate-admin-users-queries';
import type { components } from '@/generated/admin';

/**
 * DELETE /admin/users/:id mutation.
 */
export function useDeleteAdminUser(): UseMutationResult<
  components['schemas']['UserResponse'],
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await invalidateAdminUsersQueries(queryClient);
    },
  });
}
