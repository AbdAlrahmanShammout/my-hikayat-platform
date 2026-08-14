import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

import { JwtProviderModule } from './jwt-provider.module';

describe('JwtProviderModule', () => {
  it('exports the token service when configuration is loaded', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, JwtProviderModule],
    }).compile();
    expect(moduleRef.get(JwtTokenService)).toBeDefined();
    await moduleRef.close();
  });
});
