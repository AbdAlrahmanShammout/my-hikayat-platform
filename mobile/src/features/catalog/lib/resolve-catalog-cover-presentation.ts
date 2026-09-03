export type CatalogCoverPresentation =
  | { readonly kind: 'image'; readonly url: string }
  | { readonly kind: 'placeholder' };

/**
 * Decides whether a catalog cover should render as an image or a placeholder.
 */
export function resolveCatalogCoverPresentation(
  cover: { readonly url: string } | null | undefined,
): CatalogCoverPresentation {
  if (cover === null || cover === undefined) {
    return { kind: 'placeholder' };
  }
  const url: string = cover.url.trim();
  if (url.length === 0) {
    return { kind: 'placeholder' };
  }
  return { kind: 'image', url };
}
