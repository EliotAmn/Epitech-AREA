import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private repo: UserRepository) {}

    create(dto: CreateUserDto) {
        return this.repo.create(dto);
    }

    findAll() {
        return this.repo.findAll();
    }

    async findOne(id: string) {
        const user = await this.repo.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
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
