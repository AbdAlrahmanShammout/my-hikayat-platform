import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { CreateUserRepoInput } from '@/modules/user/defs/user-repository.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserMapper } from '@/modules/user/mapper/user.mapper';
import { UserRepository } from '@/modules/user/repository/user.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(input: CreateUserRepoInput, context?: TransactionContext): Promise<UserEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        isPublisher: input.isPublisher,
      },
    });
    return UserMapper.toEntity(result);
  }

  async findById(id: number): Promise<UserEntity | null> {
    const result = await this.prismaProviderService.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return UserMapper.toEntity(result);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.prismaProviderService.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return UserMapper.toEntity(result);
  }
}
