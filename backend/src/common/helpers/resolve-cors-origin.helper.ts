import { Environment } from '@/config/environment';

export type ResolveCorsOriginInput = {
  readonly env: Environment;
  readonly allowedOrigins: readonly string[];
};

/**
 * Returns the CORS `origin` option. Development reflects any request origin;
 * every other environment uses the configured allowlist.
 */
export function resolveCorsOrigin(input: ResolveCorsOriginInput): true | string[] {
  if (input.env === Environment.DEVELOPMENT) {
    return true;
  }
  return [...input.allowedOrigins];
}
