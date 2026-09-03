import { readAccessToken } from '@/session/session-store';

/**
 * Reads the signed-in principal id from the access-token JWT payload.
 * Returns null when no token is present or the claim is missing.
 */
export function readCurrentUserId(): number | null {
  const accessToken: string | null = readAccessToken();
  if (accessToken === null) {
    return null;
  }
  const segments: string[] = accessToken.split('.');
  if (segments.length < 2) {
    return null;
  }
  try {
    const payload = JSON.parse(decodeBase64UrlToString(segments[1])) as Record<string, unknown>;
    const principalId: unknown = payload.principalId;
    return typeof principalId === 'number' && Number.isInteger(principalId) ? principalId : null;
  } catch {
    return null;
  }
}

function decodeBase64UrlToString(value: string): string {
  const bytes: Uint8Array = decodeBase64Url(value);
  return String.fromCharCode(...bytes);
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized: string = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded: string = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  const binary: string = globalThis.atob(padded);
  const bytes: Uint8Array = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
