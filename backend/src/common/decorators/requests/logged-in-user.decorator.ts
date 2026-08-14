import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { Principal } from '@/common/auth/principal.interface';
import { getUserFromRequestUseContext } from '@/common/helpers/request/get-request.helper';

export const LoggedInUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Principal => {
    return getUserFromRequestUseContext(context);
  },
);
