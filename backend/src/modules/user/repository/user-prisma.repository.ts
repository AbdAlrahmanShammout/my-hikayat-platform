import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateUserRepoInput,
  ListUsersRepoInput,
  UpdateUserRepoInput,
  UserPage,
} from '@/modules/user/defs/user-repository.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
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

  async update(input: UpdateUserRepoInput, context?: TransactionContext): Promise<UserEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.user.update({
      where: { id: input.id },
      data: {
        role: input.role,
        isPublisher: input.isPublisher,
        ...(input.passwordHash !== undefined ? { passwordHash: input.passwordHash } : {}),
      },
    });
    return UserMapper.toEntity(result);
  }

  async delete(id: number, context?: TransactionContext): Promise<UserEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return UserMapper.toEntity(result);
  }

  async list(input: ListUsersRepoInput): Promise<UserPage> {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (input.role !== undefined) {
      where.role = input.role;
    }
    if (input.isPublisher !== undefined) {
      where.isPublisher = input.isPublisher;
    }
    if (input.email !== undefined) {
      where.email = input.email;
    }
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.user.count({ where }),
    ]);
    return {
      entities: rows.map((row) => UserMapper.toEntity(row)),
      total,
    };
  }

  async countByRole(role: UserRole): Promise<number> {
    return this.prismaProviderService.user.count({
      where: { role, deletedAt: null },
    });
  }
}
