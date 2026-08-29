const MS_PER_HOUR: number = 60 * 60 * 1000;
const MS_PER_DAY: number = 24 * MS_PER_HOUR;

/**
 * Formats remaining trial time for display only.
 * Does not grant or revoke full-book access — backend entitlement stays authoritative.
 */
export function formatTrialRemainingLabel(
  trialEndsAt: unknown,
  now: Date = new Date(),
): string | null {
  if (typeof trialEndsAt !== 'string' || trialEndsAt.trim().length === 0) {
    return null;
  }
  const endsAtMs: number = Date.parse(trialEndsAt);
  if (!Number.isFinite(endsAtMs)) {
    return null;
  }
  const remainingMs: number = endsAtMs - now.getTime();
  if (remainingMs <= 0) {
    return 'Trial ending soon (server decides access)';
  }
  const wholeDays: number = Math.floor(remainingMs / MS_PER_DAY);
  if (wholeDays >= 1) {
    return wholeDays === 1 ? '1 day remaining' : `${wholeDays} days remaining`;
  }
  const wholeHours: number = Math.max(1, Math.ceil(remainingMs / MS_PER_HOUR));
  return wholeHours === 1 ? '1 hour remaining' : `${wholeHours} hours remaining`;
}
