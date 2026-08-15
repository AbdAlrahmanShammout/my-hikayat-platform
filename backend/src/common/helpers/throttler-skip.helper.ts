import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_CREDENTIAL_ROUTE_KEY } from '@/common/decorators/route/credential-route.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/route/public-route.decorator';

const reflector = new Reflector();

function hasRouteMetadata(context: ExecutionContext, metadataKey: string): boolean {
  return (
    reflector.getAllAndOverride<boolean>(metadataKey, [
      context.getHandler(),
      context.getClass(),
    ]) === true
  );
}

export function shouldSkipUnauthenticatedThrottle(context: ExecutionContext): boolean {
  return (
    !hasRouteMetadata(context, IS_PUBLIC_KEY) || hasRouteMetadata(context, IS_CREDENTIAL_ROUTE_KEY)
  );
}

export function shouldSkipCredentialThrottle(context: ExecutionContext): boolean {
  return !hasRouteMetadata(context, IS_CREDENTIAL_ROUTE_KEY);
}
