import { Injectable, NotFoundException } from '@nestjs/common';

import { PasswordService } from '../common/password/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(dto: CreateUserDto) {
    // Hash the password if provided
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await this.passwordService.hash(dto.password);
    }

    return this.repository.create({
      email: dto.email,
      name: dto.name,
      password_hash: passwordHash,
      auth_platform: dto.auth_platform,
    });
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.repository.findByEmail(email);
    if (!user) return null;
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findOne(id);
    if (!user.password_hash) {
      // User doesn't have a password (likely OAuth-only account)
      throw new Error('Password change not supported for this account');
    }

    const ok = await this.passwordService.compare(
      currentPassword,
      user.password_hash,
    );

    if (!ok) {
      const err: any = new Error('Current password is incorrect');
      err.status = 401;
      throw err;
    }

    const newHash = await this.passwordService.hash(newPassword);
    return this.repository.update(id, { password_hash: newHash });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.delete(id);
  }
}
