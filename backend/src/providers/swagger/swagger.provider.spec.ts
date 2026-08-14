import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { Environment } from '@/config/environment';

import { SwaggerProvider } from './swagger.provider';

describe('SwaggerProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not register documentation outside the enabled environments', () => {
    const setupSpy = jest.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined);
    const mockApp = {
      get: jest.fn().mockReturnValue({ env: Environment.TEST }),
    } as unknown as INestApplication;
    SwaggerProvider.setupSwagger(mockApp);
    expect(setupSpy).not.toHaveBeenCalled();
  });

  it('registers one UI per audience when documentation is enabled', () => {
    const setupSpy = jest.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined);
    jest.spyOn(SwaggerModule, 'createDocument').mockReturnValue({
      openapi: '3.0.0',
      info: { title: 'test', version: '1.0' },
      paths: {},
    });
    const mockApp = {
      get: jest.fn().mockReturnValue({ env: Environment.DEVELOPMENT }),
    } as unknown as INestApplication;
    SwaggerProvider.setupSwagger(mockApp);
    expect(setupSpy).toHaveBeenCalledTimes(3);
    expect(setupSpy).toHaveBeenCalledWith(
      'docs/reader',
      mockApp,
      expect.any(Object),
      expect.objectContaining({ jsonDocumentUrl: 'docs/reader-json' }),
    );
  });
});
