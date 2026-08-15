function readClientAddress(req: Record<string, unknown>): string {
  const ips: unknown = req.ips;
  if (Array.isArray(ips) && ips.length > 0 && typeof ips[0] === 'string') {
    return ips[0];
  }
  return typeof req.ip === 'string' ? req.ip : 'unknown';
}

function readEmail(body: unknown): string {
  if (typeof body !== 'object' || body === null || !('email' in body)) {
    return '';
  }
  const email: unknown = body.email;
  if (typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

export function getCredentialThrottleTracker(req: Record<string, unknown>): string {
  const email: string = readEmail(req.body);
  if (email !== '') {
    return `email:${email}`;
  }
  return `ip:${readClientAddress(req)}`;
}
