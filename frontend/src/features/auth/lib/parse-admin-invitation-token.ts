/**
 * Reads the one-time invitation token from the accept URL. Blank means missing.
 */
export function parseAdminInvitationToken(searchParams: URLSearchParams): string | null {
  const rawToken: string | null = searchParams.get('token');
  if (rawToken === null) {
    return null;
  }
  const token: string = rawToken.trim();
  return token === '' ? null : token;
}
