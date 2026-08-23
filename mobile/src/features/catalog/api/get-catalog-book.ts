import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type CatalogBook = components['schemas']['BookResponse'];

/**
 * Loads one catalog-visible book. Backend returns 404 when not visible.
 */
export async function getCatalogBook(bookId: number): Promise<CatalogBook> {
  return requestJson<CatalogBook>({
    path: `/reader/catalog/${bookId}`,
    method: 'GET',
  });
}
