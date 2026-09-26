const MS_PER_DAY: number = 24 * 60 * 60 * 1000;

export type TrialRemainingRingModel = {
  readonly dayCount: number;
  readonly progress: number;
};

/**
 * Remaining trial days and ring fill from server trial dates. Display only.
 */
export function resolveTrialRemainingRing(input: {
  readonly trialStartedAt: unknown;
  readonly trialEndsAt: unknown;
  readonly now: Date;
}): TrialRemainingRingModel | null {
  const endsAtMs: number | null = parseIsoMs(input.trialEndsAt);
  if (endsAtMs === null) {
    return null;
  }
  const remainingMs: number = endsAtMs - input.now.getTime();
  if (remainingMs <= 0) {
    return { dayCount: 0, progress: 0 };
  }
  const wholeDays: number = Math.floor(remainingMs / MS_PER_DAY);
  const dayCount: number = wholeDays >= 1 ? wholeDays : 1;
  const totalMs: number | null = resolveTotalMs(input.trialStartedAt, endsAtMs);
  const progress: number = totalMs === null ? 1 : clampUnit(remainingMs / totalMs);
  return { dayCount, progress };
}

function resolveTotalMs(trialStartedAt: unknown, endsAtMs: number): number | null {
  const startedAtMs: number | null = parseIsoMs(trialStartedAt);
  if (startedAtMs === null || endsAtMs <= startedAtMs) {
    return null;
  }
  return endsAtMs - startedAtMs;
}

function parseIsoMs(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  const parsed: number = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}
