export type SearchParamValue = string | number | boolean | undefined;

/**
 * Builds a query string from defined values. Omits undefined keys.
 */
export function toSearchParams(values: Record<string, SearchParamValue>): string {
  const params: URLSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      continue;
    }
    params.set(key, String(value));
  }
  const encoded: string = params.toString();
  return encoded === '' ? '' : `?${encoded}`;
}
