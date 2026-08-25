/**
 * Returns true when a checkout return URL is allowed by the dedicated allowlist.
 * Supports http(s) origins and custom schemes such as `reader://`.
 */
export function isCheckoutReturnUrlAllowed(
  urlValue: string,
  allowedOrigins: readonly string[],
): boolean {
  let parsed: URL;
  try {
    parsed = new URL(urlValue);
  } catch {
    return false;
  }
  for (const allowed of allowedOrigins) {
    if (matchesAllowedCheckoutReturn(parsed, allowed.trim())) {
      return true;
    }
  }
  return false;
}

function matchesAllowedCheckoutReturn(parsed: URL, allowed: string): boolean {
  if (allowed.length === 0) {
    return false;
  }
  const schemeOnly: RegExpMatchArray | null = allowed.match(/^([a-z][a-z0-9+.-]*):\/\/?$/i);
  if (schemeOnly?.[1] !== undefined) {
    return parsed.protocol.toLowerCase() === `${schemeOnly[1].toLowerCase()}:`;
  }
  let allowedUrl: URL;
  try {
    allowedUrl = new URL(allowed);
  } catch {
    return false;
  }
  if (parsed.origin !== 'null' && allowedUrl.origin !== 'null') {
    return parsed.origin === allowedUrl.origin;
  }
  if (parsed.protocol.toLowerCase() !== allowedUrl.protocol.toLowerCase()) {
    return false;
  }
  if (allowedUrl.hostname.length === 0) {
    return true;
  }
  return parsed.hostname.toLowerCase() === allowedUrl.hostname.toLowerCase();
}
