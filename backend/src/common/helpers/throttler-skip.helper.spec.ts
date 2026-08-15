import type { ExecutionContext } from '@nestjs/common';

import { CredentialRoute } from '@/common/decorators/route/credential-route.decorator';
import { PublicRoute } from '@/common/decorators/route/public-route.decorator';

import {
  shouldSkipCredentialThrottle,
  shouldSkipUnauthenticatedThrottle,
} from './throttler-skip.helper';

class ProtectedProbeController {
  list(this: void): void {}
}

class PublicProbeController {
  @PublicRoute()
  list(this: void): void {}
}

class CredentialProbeController {
  @PublicRoute()
  @CredentialRoute()
  login(this: void): void {}
}

function createContext(controller: new () => unknown, handler: () => void): ExecutionContext {
  return {
    getClass: () => controller,
    getHandler: () => handler,
  } as ExecutionContext;
}

describe('throttler skip helpers', () => {
  it('applies the unauthenticated limit only to public non-credential routes', () => {
    expect(
      shouldSkipUnauthenticatedThrottle(
        createContext(ProtectedProbeController, ProtectedProbeController.prototype.list),
      ),
    ).toBe(true);
    expect(
      shouldSkipUnauthenticatedThrottle(
        createContext(PublicProbeController, PublicProbeController.prototype.list),
      ),
    ).toBe(false);
    expect(
      shouldSkipUnauthenticatedThrottle(
        createContext(CredentialProbeController, CredentialProbeController.prototype.login),
      ),
    ).toBe(true);
  });

  it('applies the credential limit only to credential routes', () => {
    expect(
      shouldSkipCredentialThrottle(
        createContext(PublicProbeController, PublicProbeController.prototype.list),
      ),
    ).toBe(true);
    expect(
      shouldSkipCredentialThrottle(
        createContext(CredentialProbeController, CredentialProbeController.prototype.login),
      ),
    ).toBe(false);
  });
});
