import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { AdminInvitationService } from './admin-invitation.service';
import { AdminInvitationPrismaRepository } from './repository/admin-invitation-prisma.repository';
import { AdminInvitationRepository } from './repository/admin-invitation.repository';
import { UserPrismaRepository } from './repository/user-prisma.repository';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseProviderModule, AuditModule],
  providers: [
    UserService,
    AdminInvitationService,
    { provide: UserRepository, useClass: UserPrismaRepository },
    { provide: AdminInvitationRepository, useClass: AdminInvitationPrismaRepository },
  ],
  exports: [UserService, AdminInvitationService],
})
export class UserModule {}
