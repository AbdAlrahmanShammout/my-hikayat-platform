export function resolveUtcMonthBounds(at: Date): {
  readonly startsAt: Date;
  readonly endsAt: Date;
} {
  const startsAt: Date = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1));
  const endsAt: Date = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1));
  return { startsAt, endsAt };
}
