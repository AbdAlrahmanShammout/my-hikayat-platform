import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { UserPage } from '@/modules/user/defs/user-repository.defs';
import {
  CreateUserServiceInput,
  DeleteManagedUserServiceInput,
  EnablePublisherCapabilityServiceInput,
  ListUsersServiceInput,
  UpdateManagedUserServiceInput,
} from '@/modules/user/defs/user-service.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserEmailConflictException } from '@/modules/user/exceptions/user-email-conflict.exception';
import { UserInvalidCapabilityException } from '@/modules/user/exceptions/user-invalid-capability.exception';
import { UserLastAdminException } from '@/modules/user/exceptions/user-last-admin.exception';
import { UserSelfManagementException } from '@/modules/user/exceptions/user-self-management.exception';
import { UserRepository } from '@/modules/user/repository/user.repository';

type ManagedUserCapability = {
  readonly role: UserRole;
  readonly isPublisher: boolean;
};

type AppendManagedUserAuditsInput = {
  readonly actorUserId: number;
  readonly from: UserEntity;
  readonly to: UserEntity;
};

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
      const updated: UserEntity = await this.userRepository.update(
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

  async listUsers(input: ListUsersServiceInput = {}): Promise<UserPage> {
    return this.userRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      role: input.role,
      isPublisher: input.isPublisher,
      email: input.email === undefined ? undefined : UserService.normalizeEmail(input.email),
    });
  }

  async updateManagedUser(input: UpdateManagedUserServiceInput): Promise<UserEntity> {
    const user: UserEntity = await this.getUserById(input.userId);
    UserService.assertNotSelf(input.actorUserId, user.id);
    const next: ManagedUserCapability = UserService.resolveManagedCapability(user, input);
    if (next.role === user.role && next.isPublisher === user.isPublisher) {
      return user;
    }
    await this.assertCanLeaveAdminRole(user, next.role);
    return this.transactionRunner.run(async (context: TransactionContext) => {
      const updated: UserEntity = await this.userRepository.update(
        {
          id: user.id,
          role: next.role,
          isPublisher: next.isPublisher,
        },
        context,
      );
      await this.appendManagedUserAudits(
        { actorUserId: input.actorUserId, from: user, to: updated },
        context,
      );
      return updated;
    });
  }

  async deleteManagedUser(input: DeleteManagedUserServiceInput): Promise<UserEntity> {
    const user: UserEntity = await this.getUserById(input.userId);
    UserService.assertNotSelf(input.actorUserId, user.id);
    await this.assertCanLeaveAdminRole(user, UserRole.READER);
    return this.transactionRunner.run(async (context: TransactionContext) => {
      const deleted: UserEntity = await this.userRepository.delete(user.id, context);
      await this.auditLogService.append(
        {
          actorUserId: input.actorUserId,
          action: AuditAction.USER_DELETED,
          subjectType: AuditSubjectType.USER,
          subjectId: user.id,
          metadata: {
            fromRole: user.role,
            wasPublisher: user.isPublisher,
          },
        },
        context,
      );
      return deleted;
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

  private async assertCanLeaveAdminRole(user: UserEntity, nextRole: UserRole): Promise<void> {
    if (user.role !== UserRole.ADMIN || nextRole === UserRole.ADMIN) {
      return;
    }
    const adminCount: number = await this.userRepository.countByRole(UserRole.ADMIN);
    if (adminCount <= 1) {
      throw new UserLastAdminException();
    }
  }

  private async appendManagedUserAudits(
    input: AppendManagedUserAuditsInput,
    context?: TransactionContext,
  ): Promise<void> {
    if (input.from.role !== input.to.role) {
      await this.auditLogService.append(
        {
          actorUserId: input.actorUserId,
          action: AuditAction.USER_ROLE_CHANGED,
          subjectType: AuditSubjectType.USER,
          subjectId: input.to.id,
          metadata: {
            fromRole: input.from.role,
            toRole: input.to.role,
          },
        },
        context,
      );
    }
    if (input.from.isPublisher === input.to.isPublisher) {
      return;
    }
    await this.auditLogService.append(
      {
        actorUserId: input.actorUserId,
        action: input.to.isPublisher
          ? AuditAction.PUBLISHER_ENABLED
          : AuditAction.PUBLISHER_DISABLED,
        subjectType: AuditSubjectType.USER,
        subjectId: input.to.id,
        metadata: {
          fromRole: input.from.role,
          toRole: input.to.role,
        },
      },
      context,
    );
  }

  private static assertNotSelf(actorUserId: number, userId: number): void {
    if (actorUserId === userId) {
      throw new UserSelfManagementException();
    }
  }

  private static resolveManagedCapability(
    current: UserEntity,
    input: UpdateManagedUserServiceInput,
  ): ManagedUserCapability {
    if (input.role === UserRole.AUTHOR && input.isPublisher === false) {
      throw new UserInvalidCapabilityException(input.role, input.isPublisher);
    }
    if (input.role === UserRole.READER && input.isPublisher === true) {
      throw new UserInvalidCapabilityException(input.role, input.isPublisher);
    }
    if (input.role !== undefined) {
      const isPublisher: boolean =
        input.role === UserRole.AUTHOR
          ? true
          : input.role === UserRole.READER
            ? false
            : (input.isPublisher ?? current.isPublisher);
      return { role: input.role, isPublisher };
    }
    if (input.isPublisher === true && current.role === UserRole.READER) {
      return { role: UserRole.AUTHOR, isPublisher: true };
    }
    if (input.isPublisher === false && current.role === UserRole.AUTHOR) {
      return { role: UserRole.READER, isPublisher: false };
    }
    return {
      role: current.role,
      isPublisher: input.isPublisher ?? current.isPublisher,
    };
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
