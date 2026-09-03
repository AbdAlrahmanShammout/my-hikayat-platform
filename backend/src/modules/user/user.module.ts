import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { JwtProviderModule } from '@/providers/jwt/jwt-provider.module';
import { MailProviderModule } from '@/providers/mail/mail-provider.module';

import { AdminInvitationService } from './admin-invitation.service';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { AdminInvitationPrismaRepository } from './repository/admin-invitation-prisma.repository';
import { AdminInvitationRepository } from './repository/admin-invitation.repository';
import { AuthRefreshTokenPrismaRepository } from './repository/auth-refresh-token-prisma.repository';
import { AuthRefreshTokenRepository } from './repository/auth-refresh-token.repository';
import { UserPrismaRepository } from './repository/user-prisma.repository';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseProviderModule, AuditModule, MailProviderModule, JwtProviderModule],
  providers: [
    UserService,
    AdminInvitationService,
    AuthRefreshTokenService,
    { provide: UserRepository, useClass: UserPrismaRepository },
    { provide: AdminInvitationRepository, useClass: AdminInvitationPrismaRepository },
    { provide: AuthRefreshTokenRepository, useClass: AuthRefreshTokenPrismaRepository },
  ],
  exports: [UserService, AdminInvitationService, AuthRefreshTokenService],
})
export class UserModule {}
