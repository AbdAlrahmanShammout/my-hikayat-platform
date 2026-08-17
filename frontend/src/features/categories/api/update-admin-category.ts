import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

export type UpdateAdminCategoryInput = {
  readonly categoryId: number;
  readonly body: components['schemas']['UpdateCategoryRequestDto'];
};

/**
 * Updates a category weight only.
 */
export async function updateAdminCategory(
  input: UpdateAdminCategoryInput,
): Promise<components['schemas']['CategoryResponse']> {
  return requestJson<components['schemas']['CategoryResponse']>({
    path: `/admin/categories/${input.categoryId}`,
    method: 'PATCH',
    body: input.body,
  });
}
