/**
 * Converts a JWT-style duration string (e.g. 15m, 1h, 30d) into milliseconds.
 */
export function parseJwtExpiresInToMilliseconds(expiresIn: string): number {
  const match: RegExpMatchArray | null = /^(\d+)([smhd])$/.exec(expiresIn.trim());
  if (match === null) {
    throw new Error(`Unsupported JWT expiresIn value: ${expiresIn}`);
  }
  const amount: number = Number.parseInt(match[1], 10);
  const unit: string = match[2];
  if (unit === 's') {
    return amount * 1000;
  }
  if (unit === 'm') {
    return amount * 60 * 1000;
  }
  if (unit === 'h') {
    return amount * 60 * 60 * 1000;
  }
  return amount * 24 * 60 * 60 * 1000;
}
