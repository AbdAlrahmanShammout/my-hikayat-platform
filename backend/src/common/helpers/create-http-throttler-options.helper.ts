import type { ThrottlerGetTrackerFunction, ThrottlerModuleOptions } from '@nestjs/throttler';

import {
  CREDENTIAL_THROTTLE_LIMIT,
  CREDENTIAL_THROTTLE_NAME,
  CREDENTIAL_THROTTLE_TTL_MS,
  DEFAULT_THROTTLE_LIMIT,
  DEFAULT_THROTTLE_NAME,
  DEFAULT_THROTTLE_TTL_MS,
  UNAUTHENTICATED_THROTTLE_LIMIT,
  UNAUTHENTICATED_THROTTLE_NAME,
  UNAUTHENTICATED_THROTTLE_TTL_MS,
} from '@/common/constants/http-surface.constant';
import { getCredentialThrottleTracker } from '@/common/helpers/get-credential-throttle-tracker.helper';
import {
  shouldSkipCredentialThrottle,
  shouldSkipUnauthenticatedThrottle,
} from '@/common/helpers/throttler-skip.helper';

export function createHttpThrottlerOptions(): ThrottlerModuleOptions {
  return {
    throttlers: [
      {
        name: DEFAULT_THROTTLE_NAME,
        ttl: DEFAULT_THROTTLE_TTL_MS,
        limit: DEFAULT_THROTTLE_LIMIT,
      },
      {
        name: UNAUTHENTICATED_THROTTLE_NAME,
        ttl: UNAUTHENTICATED_THROTTLE_TTL_MS,
        limit: UNAUTHENTICATED_THROTTLE_LIMIT,
        skipIf: shouldSkipUnauthenticatedThrottle,
      },
      {
        name: CREDENTIAL_THROTTLE_NAME,
        ttl: CREDENTIAL_THROTTLE_TTL_MS,
        limit: CREDENTIAL_THROTTLE_LIMIT,
        getTracker: getCredentialThrottleTracker as ThrottlerGetTrackerFunction,
        skipIf: shouldSkipCredentialThrottle,
      },
    ],
  };
}
