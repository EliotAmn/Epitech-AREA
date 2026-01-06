import { PasswordService } from '../common/password/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
export declare class UserService {
    private readonly repository;
    private readonly passwordService;
    constructor(repository: UserRepository, passwordService: PasswordService);
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
    findByEmail(email: string): Promise<{
        name: string;
        id: string;
        created_at: Date;
        email: string;
        auth_platform: string;
        auth_id: string | null;
        password_hash: string | null;
    } | null>;
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
