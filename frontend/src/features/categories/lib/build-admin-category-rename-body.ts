import type { AdminCategoryRenameFormValues } from '@/features/categories/schemas/admin-category-rename-form.schema';
import type { components } from '@/generated/admin';

type BuildAdminCategoryRenameBodyInput = {
  readonly category: components['schemas']['CategoryResponse'];
  readonly values: AdminCategoryRenameFormValues;
};

/**
 * Builds a PATCH body with only changed name/slug. Returns null when nothing changed.
 */
export function buildAdminCategoryRenameBody(
  input: BuildAdminCategoryRenameBodyInput,
): components['schemas']['UpdateCategoryRequestDto'] | null {
  const body: components['schemas']['UpdateCategoryRequestDto'] = {};
  if (input.values.name !== input.category.name) {
    body.name = input.values.name;
  }
  if (input.values.slug !== input.category.slug) {
    body.slug = input.values.slug;
  }
  if (body.name === undefined && body.slug === undefined) {
    return null;
  }
  return body;
}
