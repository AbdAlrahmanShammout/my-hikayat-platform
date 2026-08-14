import { Module } from '@nestjs/common';

import { AuthModule } from '@/authentication/auth.module';

@Module({
  imports: [AuthModule],
})
export class AuthorApiModule {}
