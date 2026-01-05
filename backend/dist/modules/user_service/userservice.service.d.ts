import { UserServiceRepository } from './userservice.repository';
export declare class UserServiceService {
    private readonly userServiceRepository;
    constructor(userServiceRepository: UserServiceRepository);
    fromUserIdAndServiceName(userId: string, serviceName: string): import("@prisma/client").Prisma.Prisma__UserServiceClient<{
        id: string;
        service_name: string;
        service_config: import("@prisma/client/runtime/library").JsonValue | null;
        errored: boolean;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
