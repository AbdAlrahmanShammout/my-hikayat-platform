import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import {
  CreateUserServiceInput,
  EnablePublisherCapabilityServiceInput,
} from '@/modules/user/defs/user-service.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserEmailConflictException } from '@/modules/user/exceptions/user-email-conflict.exception';
import { UserRepository } from '@/modules/user/repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogService: AuditLogService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async createUser(input: CreateUserServiceInput): Promise<UserEntity> {
    const email: string = UserService.normalizeEmail(input.email);
    const existingUser: UserEntity | null = await this.userRepository.findByEmail(email);
    if (existingUser !== null) {
      throw new UserEmailConflictException(email);
    }
    return this.userRepository.create({
      email,
      passwordHash: input.passwordHash,
      role: UserRole.READER,
      isPublisher: false,
    });
  }

  async enablePublisherCapability(
    input: EnablePublisherCapabilityServiceInput,
  ): Promise<UserEntity> {
    const user: UserEntity = await this.getUserById(input.userId);
    const nextRole: UserRole = user.role === UserRole.READER ? UserRole.AUTHOR : user.role;
    if (user.isPublisher && user.role === nextRole) {
      return user;
    }
    return this.transactionRunner.run(async (context: TransactionContext) => {
      const updated: UserEntity = await this.userRepository.updatePublisherCapability(
        {
          id: user.id,
          role: nextRole,
          isPublisher: true,
        },
        context,
      );
      await this.auditLogService.append(
        {
          actorUserId: input.userId,
          action: AuditAction.PUBLISHER_ENABLED,
          subjectType: AuditSubjectType.USER,
          subjectId: user.id,
          metadata: {
            fromRole: user.role,
            toRole: nextRole,
          },
        },
        context,
      );
      return updated;
    });
  }

  async findUserById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user: UserEntity | null = await this.findUserById(id);
    if (user === null) {
      throw new ResourceNotFoundException('User', id);
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(UserService.normalizeEmail(email));
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    const normalizedEmail: string = UserService.normalizeEmail(email);
    const user: UserEntity | null = await this.findUserByEmail(normalizedEmail);
    if (user === null) {
      throw new ResourceNotFoundException('User', normalizedEmail);
    }
    return user;
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
