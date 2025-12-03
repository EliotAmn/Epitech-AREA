import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PasswordService } from '../common/password/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private repo: UserRepository,
    private passwordService: PasswordService,
  ) {}

  async create(dto: CreateUserDto) {
    const incoming = dto;

    const payload: Prisma.UserCreateInput = {
      email: incoming.email,
      name: incoming.name,
    } as Prisma.UserCreateInput;

    if (incoming.password) {
      const hash = await this.passwordService.hash(incoming.password);
      (payload as unknown as Record<string, unknown>).password_hash = hash;
    }

    return this.repo.create(payload);
  }

  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
