import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { CreateAuthRefreshTokenRepoInput } from '@/modules/user/defs/auth-refresh-token-repository.defs';
import { AuthRefreshTokenEntity } from '@/modules/user/entity/auth-refresh-token.entity';
import { AuthRefreshTokenMapper } from '@/modules/user/mapper/auth-refresh-token.mapper';
import { AuthRefreshTokenRepository } from '@/modules/user/repository/auth-refresh-token.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class AuthRefreshTokenPrismaRepository implements AuthRefreshTokenRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateAuthRefreshTokenRepoInput,
    context?: TransactionContext,
  ): Promise<AuthRefreshTokenEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.authRefreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
    return AuthRefreshTokenMapper.toEntity(result);
  }

  async findByTokenHash(tokenHash: string): Promise<AuthRefreshTokenEntity | null> {
    const result = await this.prismaProviderService.authRefreshToken.findFirst({
      where: { tokenHash, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return AuthRefreshTokenMapper.toEntity(result);
  }

  async revoke(id: number, revokedAt: Date, context?: TransactionContext): Promise<void> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    await client.authRefreshToken.update({
      where: { id },
      data: { revokedAt },
    });
  }

  async revokeAllForUser(
    userId: number,
    revokedAt: Date,
    context?: TransactionContext,
  ): Promise<void> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    await client.authRefreshToken.updateMany({
      where: { userId, revokedAt: null, deletedAt: null },
      data: { revokedAt },
    });
  }
}
