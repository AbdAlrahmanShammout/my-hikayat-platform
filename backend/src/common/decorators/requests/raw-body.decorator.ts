import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { getRequestFromContext } from '@/common/helpers/request/get-request.helper';

export const RawBody = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Buffer | undefined => {
    const request: Request & { rawBody?: Buffer } = getRequestFromContext(context) as Request & {
      rawBody?: Buffer;
    };
    return request.rawBody;
  },
);
