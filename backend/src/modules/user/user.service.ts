import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { CreateUserServiceInput } from '@/modules/user/defs/user-service.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserEmailConflictException } from '@/modules/user/exceptions/user-email-conflict.exception';
import { UserRepository } from '@/modules/user/repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
