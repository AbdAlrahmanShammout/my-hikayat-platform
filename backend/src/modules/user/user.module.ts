import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { UserPrismaRepository } from './repository/user-prisma.repository';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseProviderModule],
  providers: [UserService, { provide: UserRepository, useClass: UserPrismaRepository }],
  exports: [UserService],
})
export class UserModule {}
