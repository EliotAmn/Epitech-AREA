import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    create(dto: CreateUserDto): Promise<{
        id: string;
        created_at: Date;
        name: string;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        created_at: Date;
        name: string;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        created_at: Date;
        name: string;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        created_at: Date;
        name: string;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        created_at: Date;
        name: string;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }>;
}
