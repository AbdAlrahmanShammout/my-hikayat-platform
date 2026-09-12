import type { User } from '@/session/session.types';

/**
 * Coerces a session principal so missing displayName stays null instead of undefined.
 */
export function normalizeSessionUser(user: User): User {
  const displayName: string | null = coerceDisplayName(user.displayName);
  return {
    ...user,
    displayName,
  };
}

function coerceDisplayName(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed: string = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed;
}
