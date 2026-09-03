export type CatalogBookAttributionInput = {
  readonly authorName?: string | null;
  readonly publisherName?: string | null;
};

export type CatalogBookAttribution = {
  readonly authorLine: string | null;
  readonly publisherLine: string | null;
};

/**
 * Builds user-facing author/publisher lines for catalog surfaces.
 * Never falls back to uploader account email.
 */
export function resolveCatalogBookAttribution(
  book: CatalogBookAttributionInput,
): CatalogBookAttribution {
  return {
    authorLine: toDisplayLine(book.authorName, 'By'),
    publisherLine: toDisplayLine(book.publisherName, 'Publisher'),
  };
}

function toDisplayLine(value: string | null | undefined, prefix: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed: string = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return `${prefix} ${trimmed}`;
}
