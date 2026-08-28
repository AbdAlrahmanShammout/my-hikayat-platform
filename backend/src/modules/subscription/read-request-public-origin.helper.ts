type RequestPublicOriginInput = {
  readonly protocol: string;
  readonly headers: {
    readonly [headerName: string]: string | string[] | undefined;
  };
  get(name: string): string | undefined;
};

/**
 * Reads the public origin of an incoming HTTP request, honoring reverse-proxy headers.
 */
export function readRequestPublicOrigin(request: RequestPublicOriginInput): string {
  const forwardedProto: string | undefined = readFirstHeaderValue(
    request.headers['x-forwarded-proto'],
  );
  const forwardedHost: string | undefined = readFirstHeaderValue(
    request.headers['x-forwarded-host'],
  );
  const protocol: string = forwardedProto ?? request.protocol;
  const host: string = forwardedHost ?? request.get('host') ?? '';
  return `${protocol}://${host}`;
}

function readFirstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value.split(',')[0]?.trim();
  }
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0].split(',')[0]?.trim();
  }
  return undefined;
}
