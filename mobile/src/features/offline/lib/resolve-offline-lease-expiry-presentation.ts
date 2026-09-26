/**
 * Remaining time at or below this threshold is shown as "approaching expiry".
 * Display-only UX constant; does not change lease validation or entitlement.
 */
export const OFFLINE_LEASE_APPROACHING_THRESHOLD_MS: number = 3 * 24 * 60 * 60 * 1000;

export type OfflineLeaseExpiryState =
  | 'active'
  | 'approaching'
  | 'expired'
  | 'clock_rollback'
  | 'unavailable';

export type OfflineLeaseExpiryPresentation = {
  readonly state: OfflineLeaseExpiryState;
  readonly label: string;
};

export type ResolveOfflineLeaseExpiryPresentationInput = {
  readonly expiresAt: string | null | undefined;
  readonly nowMs: number;
  readonly isClockRollbackDetected?: boolean;
};

/**
 * Maps stored lease expiry + trusted time into a safe user-facing label.
 * Does not verify signatures or grant access — validation stays fail-closed elsewhere.
 */
export function resolveOfflineLeaseExpiryPresentation(
  input: ResolveOfflineLeaseExpiryPresentationInput,
): OfflineLeaseExpiryPresentation {
  if (input.isClockRollbackDetected === true) {
    return {
      state: 'clock_rollback',
      label: 'Device time changed. Connect to refresh this download.',
    };
  }
  if (typeof input.expiresAt !== 'string' || input.expiresAt.trim().length === 0) {
    return {
      state: 'unavailable',
      label: 'Offline access unavailable on this download.',
    };
  }
  const expiresAtMs: number = Date.parse(input.expiresAt);
  if (!Number.isFinite(expiresAtMs)) {
    return {
      state: 'unavailable',
      label: 'Offline access unavailable on this download.',
    };
  }
  const remainingMs: number = expiresAtMs - input.nowMs;
  if (remainingMs <= 0) {
    return {
      state: 'expired',
      label: 'Offline access locked. Connect to refresh.',
    };
  }
  const dateLabel: string = formatLeaseExpiryDate(expiresAtMs);
  if (remainingMs <= OFFLINE_LEASE_APPROACHING_THRESHOLD_MS) {
    return {
      state: 'approaching',
      label: `Expires soon · until ${dateLabel}`,
    };
  }
  return {
    state: 'active',
    label: `Offline access until ${dateLabel}`,
  };
}

const LEASE_MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Short My Books chip copy. Does not change lease validation or the longer text label.
 */
export function resolveOfflineLeaseChipLabel(
  presentation: OfflineLeaseExpiryPresentation,
  expiresAt: string | null | undefined,
): string {
  if (presentation.state === 'active') {
    return 'Available offline';
  }
  if (presentation.state === 'approaching') {
    const dateLabel: string | null = formatReadableLeaseDate(expiresAt);
    return dateLabel === null ? presentation.label : `Expires ${dateLabel}`;
  }
  if (presentation.state === 'expired') {
    return 'Lease expired';
  }
  return presentation.label;
}

function formatLeaseExpiryDate(expiresAtMs: number): string {
  const date: Date = new Date(expiresAtMs);
  const year: number = date.getUTCFullYear();
  const month: string = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day: string = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReadableLeaseDate(expiresAt: string | null | undefined): string | null {
  if (typeof expiresAt !== 'string' || expiresAt.trim().length === 0) {
    return null;
  }
  const expiresAtMs: number = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) {
    return null;
  }
  const date: Date = new Date(expiresAtMs);
  const month: string | undefined = LEASE_MONTH_LABELS[date.getUTCMonth()];
  if (month === undefined) {
    return null;
  }
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}
