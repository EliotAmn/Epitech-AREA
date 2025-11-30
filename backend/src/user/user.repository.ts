import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {Prisma} from "@prisma/client";

@Injectable()
export class UserRepository {
    constructor(private prisma: PrismaService) {}

    create(data: Prisma.UserCreateInput) {
        return this.prisma.user.create({ data });
    }

    findAll() {
        return this.prisma.user.findMany();
    }

    findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    update(id: string, data: Prisma.UserUpdateInput) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    delete(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }
}
