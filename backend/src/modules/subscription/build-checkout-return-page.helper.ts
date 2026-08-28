/**
 * Builds an HTML page that navigates the browser to an allowlisted checkout return URL.
 */
export function buildCheckoutReturnPage(returnUrl: string): string {
  const safeHref: string = escapeHtmlAttribute(returnUrl);
  return (
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    `<meta http-equiv="refresh" content="0;url=${safeHref}">` +
    '<title>Returning to the app</title></head><body>' +
    '<p>Returning to the app…</p>' +
    `<p><a href="${safeHref}">Continue</a></p>` +
    '</body></html>'
  );
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
