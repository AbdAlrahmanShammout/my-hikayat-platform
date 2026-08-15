import type { ThrottlerGetTrackerFunction } from '@nestjs/throttler';

import {
  CREDENTIAL_THROTTLE_LIMIT,
  CREDENTIAL_THROTTLE_NAME,
  DEFAULT_THROTTLE_LIMIT,
  DEFAULT_THROTTLE_NAME,
  UNAUTHENTICATED_THROTTLE_LIMIT,
  UNAUTHENTICATED_THROTTLE_NAME,
} from '@/common/constants/http-surface.constant';
import { getCredentialThrottleTracker } from '@/common/helpers/get-credential-throttle-tracker.helper';
import {
  shouldSkipCredentialThrottle,
  shouldSkipUnauthenticatedThrottle,
} from '@/common/helpers/throttler-skip.helper';

import { createHttpThrottlerOptions } from './create-http-throttler-options.helper';

describe('createHttpThrottlerOptions', () => {
  it('registers the global floor plus unauthenticated and credential named limits', () => {
    const actualOptions = createHttpThrottlerOptions();
    expect(actualOptions).toEqual({
      throttlers: [
        {
          name: DEFAULT_THROTTLE_NAME,
          ttl: 60_000,
          limit: DEFAULT_THROTTLE_LIMIT,
        },
        {
          name: UNAUTHENTICATED_THROTTLE_NAME,
          ttl: 60_000,
          limit: UNAUTHENTICATED_THROTTLE_LIMIT,
          skipIf: shouldSkipUnauthenticatedThrottle,
        },
        {
          name: CREDENTIAL_THROTTLE_NAME,
          ttl: 60_000,
          limit: CREDENTIAL_THROTTLE_LIMIT,
          getTracker: getCredentialThrottleTracker as ThrottlerGetTrackerFunction,
          skipIf: shouldSkipCredentialThrottle,
        },
      ],
    });
  });
});
