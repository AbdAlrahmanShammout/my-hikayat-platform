import { Logger } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';

import { presentException } from '@/common/filter/present-exception';
import { Environment } from '@/config/environment';

describe('presentException', () => {
  it('sanitizes non-user-friendly 500s in production', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status, json }),
      }),
    } as unknown as ArgumentsHost;
    const logger = { error: jest.fn() } as unknown as Logger;
    const appConfigService = { env: Environment.PRODUCTION };
    presentException(new TypeError('boom'), host, appConfigService as never, logger);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      }),
    );
  });
});
