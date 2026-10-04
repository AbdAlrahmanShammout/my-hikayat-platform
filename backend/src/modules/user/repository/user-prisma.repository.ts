import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import { PlanKind } from '@/modules/subscription/enum/general.enum';
import {
  CreateUserRepoInput,
  ListUsersRepoInput,
  ManagedUserListItem,
  ManagedUserPage,
  UpdateUserRepoInput,
  UserPage,
} from '@/modules/user/defs/user-repository.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminUserSortOrder } from '@/modules/user/enum/admin-user-sort-field.enum';
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
        displayName: input.displayName,
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
    const where: Prisma.UserWhereInput = buildOperationalUserWhere(input);
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.user.findMany({
        where,
        orderBy: buildUserOrderBy(input),
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

  async listManaged(input: ListUsersRepoInput): Promise<ManagedUserPage> {
    const where: Prisma.UserWhereInput = buildOperationalUserWhere(input);
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.user.findMany({
        where,
        orderBy: buildUserOrderBy(input),
        take: input.limit,
        skip: input.offset,
        include: managedUserListInclude,
      }),
      this.prismaProviderService.user.count({ where }),
    ]);
    return {
      items: rows.map((row) => toManagedUserListItem(row)),
      total,
    };
  }

  async countByRole(role: UserRole): Promise<number> {
    return this.prismaProviderService.user.count({
      where: { role, deletedAt: null },
    });
  }
}

const managedUserListInclude = {
  subscription: { include: { plan: true } },
  authRefreshTokens: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.UserInclude;

type ManagedUserListRow = Prisma.UserGetPayload<{ include: typeof managedUserListInclude }>;

function buildOperationalUserWhere(input: ListUsersRepoInput): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { deletedAt: null };
  if (input.role !== undefined) {
    where.role = input.role;
  } else if (input.excludeRole !== undefined) {
    where.role = { not: input.excludeRole };
  }
  if (input.isPublisher !== undefined) {
    where.isPublisher = input.isPublisher;
  }
  if (input.email !== undefined) {
    where.email = input.email;
  }
  if (input.keyword !== undefined) {
    where.OR = [
      { email: { contains: input.keyword, mode: 'insensitive' } },
      { displayName: { contains: input.keyword, mode: 'insensitive' } },
    ];
  }
  return where;
}

function buildUserOrderBy(input: ListUsersRepoInput): Prisma.UserOrderByWithRelationInput[] {
  if (input.sortBy === undefined) {
    return [{ createdAt: 'desc' }, { id: 'desc' }];
  }
  const direction: Prisma.SortOrder = input.sortOrder === AdminUserSortOrder.ASC ? 'asc' : 'desc';
  return [{ [input.sortBy]: direction }, { id: 'desc' }];
}

function toManagedUserListItem(row: ManagedUserListRow): ManagedUserListItem {
  const latestSession = row.authRefreshTokens[0];
  const subscription = row.subscription;
  const plan =
    subscription !== null && subscription.deletedAt === null && subscription.plan.deletedAt === null
      ? subscription.plan
      : null;
  return {
    user: UserMapper.toEntity(row),
    lastSessionAt: latestSession === undefined ? null : latestSession.createdAt,
    currentPlan:
      plan === null
        ? null
        : {
            name: plan.name,
            kind:
              String(plan.kind) === String(PlanKind.MONTHLY_PAID)
                ? PlanKind.MONTHLY_PAID
                : PlanKind.FREE,
          },
  };
}
