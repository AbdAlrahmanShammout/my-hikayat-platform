import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  AcceptAdminInvitationRepoInput,
  AdminInvitationPage,
  CreateAdminInvitationRepoInput,
  ListAdminInvitationsRepoInput,
  ReplaceAdminInvitationDeliveryRepoInput,
  RevokeAdminInvitationRepoInput,
} from '@/modules/user/defs/admin-invitation-repository.defs';
import { AdminInvitationListStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { AdminInvitationEntity } from '@/modules/user/entity/admin-invitation.entity';
import { AdminInvitationStatus } from '@/modules/user/enum/admin-invitation-status.enum';
import { AdminInvitationMapper } from '@/modules/user/mapper/admin-invitation.mapper';
import { AdminInvitationRepository } from '@/modules/user/repository/admin-invitation.repository';
import { adminInvitationDetailsInclude } from '@/modules/user/types/admin-invitation-details.include';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class AdminInvitationPrismaRepository implements AdminInvitationRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateAdminInvitationRepoInput,
    context?: TransactionContext,
  ): Promise<AdminInvitationEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.adminInvitation.create({
      data: {
        email: input.email,
        tokenHash: input.tokenHash,
        status: AdminInvitationStatus.PENDING,
        expiresAt: input.expiresAt,
        invitedByUserId: input.invitedByUserId,
        lastSentAt: input.lastSentAt,
        resendCount: 0,
      },
    });
    return AdminInvitationMapper.toEntity(result);
  }

  async findByTokenHash(tokenHash: string): Promise<AdminInvitationEntity | null> {
    const result = await this.prismaProviderService.adminInvitation.findFirst({
      where: { tokenHash, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return AdminInvitationMapper.toEntity(result);
  }

  async findById(id: number): Promise<AdminInvitationEntity | null> {
    const result = await this.prismaProviderService.adminInvitation.findFirst({
      where: { id, deletedAt: null },
      include: adminInvitationDetailsInclude,
    });
    if (result === null) {
      return null;
    }
    return AdminInvitationMapper.toEntity(result);
  }

  async findPendingByEmail(email: string, now: Date): Promise<AdminInvitationEntity | null> {
    const result = await this.prismaProviderService.adminInvitation.findFirst({
      where: {
        email,
        status: AdminInvitationStatus.PENDING,
        expiresAt: { gt: now },
        deletedAt: null,
      },
    });
    if (result === null) {
      return null;
    }
    return AdminInvitationMapper.toEntity(result);
  }

  async list(input: ListAdminInvitationsRepoInput): Promise<AdminInvitationPage> {
    const where: Prisma.AdminInvitationWhereInput = {
      deletedAt: null,
      ...AdminInvitationPrismaRepository.buildStatusWhere(input.status, input.now),
    };
    if (input.email !== undefined) {
      where.email = input.email;
    }
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.adminInvitation.findMany({
        where,
        include: adminInvitationDetailsInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.adminInvitation.count({ where }),
    ]);
    return {
      entities: rows.map((row) => AdminInvitationMapper.toEntity(row)),
      total,
    };
  }

  async markAccepted(
    input: AcceptAdminInvitationRepoInput,
    context?: TransactionContext,
  ): Promise<AdminInvitationEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.adminInvitation.update({
      where: { id: input.id },
      data: {
        status: AdminInvitationStatus.ACCEPTED,
        acceptedAt: input.acceptedAt,
      },
    });
    return AdminInvitationMapper.toEntity(result);
  }

  async replaceDelivery(input: ReplaceAdminInvitationDeliveryRepoInput): Promise<AdminInvitationEntity> {
    const result = await this.prismaProviderService.adminInvitation.update({
      where: { id: input.id },
      data: {
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        lastSentAt: input.lastSentAt,
        resendCount: input.resendCount,
      },
    });
    return AdminInvitationMapper.toEntity(result);
  }

  async revoke(input: RevokeAdminInvitationRepoInput): Promise<AdminInvitationEntity> {
    const result = await this.prismaProviderService.adminInvitation.update({
      where: { id: input.id },
      data: {
        status: AdminInvitationStatus.REVOKED,
        revokedAt: input.revokedAt,
        revokedByUserId: input.revokedByUserId,
        revokeReason: input.revokeReason,
      },
    });
    return AdminInvitationMapper.toEntity(result);
  }

  async delete(id: number, context?: TransactionContext): Promise<void> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    await client.adminInvitation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private static buildStatusWhere(
    status: AdminInvitationListStatus | undefined,
    now: Date,
  ): Prisma.AdminInvitationWhereInput {
    if (status === undefined || status === AdminInvitationListStatus.PENDING) {
      return { status: AdminInvitationStatus.PENDING, expiresAt: { gt: now } };
    }
    if (status === AdminInvitationListStatus.EXPIRED) {
      return { status: AdminInvitationStatus.PENDING, expiresAt: { lte: now } };
    }
    if (status === AdminInvitationListStatus.ACCEPTED) {
      return { status: AdminInvitationStatus.ACCEPTED };
    }
    return { status: AdminInvitationStatus.REVOKED };
  }
}
