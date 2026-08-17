import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type UpdateAdminUserInput = {
  readonly userId: number;
  readonly body: components['schemas']['UpdateManagedUserRequestDto'];
};

/**
 * Changes a managed user's role or publisher capability.
 */
export async function updateAdminUser(
  input: UpdateAdminUserInput,
): Promise<components['schemas']['UserResponse']> {
  return requestJson<components['schemas']['UserResponse']>({
    path: `/admin/users/${input.userId}`,
    method: 'PATCH',
    body: input.body,
  });
}
