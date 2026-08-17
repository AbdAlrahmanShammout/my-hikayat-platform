import type { AdminCategoryCreateFormValues } from '@/features/categories/schemas/admin-category-create-form.schema';
import type { components } from '@/generated/admin';

/**
 * Omits blank slug and weight so the API can apply its defaults.
 */
export function buildCreateAdminCategoryBody(
  values: AdminCategoryCreateFormValues,
): components['schemas']['CreateCategoryRequestDto'] {
  const body: components['schemas']['CreateCategoryRequestDto'] = { name: values.name };
  const slug: string = values.slug.trim();
  if (slug !== '') {
    body.slug = slug;
  }
  if (values.categoryWeight !== undefined) {
    body.categoryWeight = values.categoryWeight;
  }
  return body;
}
