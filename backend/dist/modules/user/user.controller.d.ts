import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    create(dto: CreateUserDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    }>;
}
