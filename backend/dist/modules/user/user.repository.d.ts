import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class UserRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.UserCreateInput): Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }[]>;
    findById(id: string): Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findByEmail(email: string): Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, data: Prisma.UserUpdateInput): Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    delete(id: string): Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
}
