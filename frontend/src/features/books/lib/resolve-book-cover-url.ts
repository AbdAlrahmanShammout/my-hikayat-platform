type BookCoverUrlSource = {
  readonly url: string;
};

/**
 * Reads the signed cover URL from BookResponse.cover. Null when the API has no cover.
 */
export function resolveBookCoverUrl(
  cover: BookCoverUrlSource | null | undefined,
): string | null {
  if (cover === null || cover === undefined) {
    return null;
  }
  const trimmedUrl: string = cover.url.trim();
  return trimmedUrl === '' ? null : trimmedUrl;
}
