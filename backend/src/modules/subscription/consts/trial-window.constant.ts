export const TRIAL_WINDOW = {
  days: 7,
  millisecondsPerDay: 24 * 60 * 60 * 1000,
} as const;

export function resolveTrialEndsAt(
  trialStartedAt: Date,
  window: typeof TRIAL_WINDOW = TRIAL_WINDOW,
): Date {
  const windowMs: number = window.days * window.millisecondsPerDay;
  return new Date(trialStartedAt.getTime() + windowMs);
}
