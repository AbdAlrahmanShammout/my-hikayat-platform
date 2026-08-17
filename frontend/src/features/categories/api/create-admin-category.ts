import { requestJson } from '@/api/request-json';
import type { components } from '@/generated/admin';

/**
 * Creates a category. Omitted slug and weight use backend defaults.
 */
export async function createAdminCategory(
  body: components['schemas']['CreateCategoryRequestDto'],
): Promise<components['schemas']['CategoryResponse']> {
  return requestJson<components['schemas']['CategoryResponse']>({
    path: '/admin/categories',
    method: 'POST',
    body,
  });
}
