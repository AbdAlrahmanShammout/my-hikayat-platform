import { Module } from '@nestjs/common';

import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

@Module({
  providers: [JwtTokenService],
  exports: [JwtTokenService],
})
export class JwtProviderModule {}
