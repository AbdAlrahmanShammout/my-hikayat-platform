export type SearchParamValue =
  | string
  | number
  | boolean
  | undefined
  | readonly (string | number | boolean)[];

/**
 * Builds a query string from defined values. Omits undefined keys.
 * Array values are repeated so the API can OR within one filter.
 */
export function toSearchParams(values: Record<string, SearchParamValue>): string {
  const params: URLSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    appendSearchValue(params, key, value);
  }
  const encoded: string = params.toString();
  return encoded === '' ? '' : `?${encoded}`;
}

function appendSearchValue(params: URLSearchParams, key: string, value: SearchParamValue): void {
  if (value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      params.append(key, String(entry));
    }
    return;
  }
  params.set(key, String(value));
}
