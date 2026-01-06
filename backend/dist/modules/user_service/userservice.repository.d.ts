import { PrismaService } from '../prisma/prisma.service';
export declare class UserServiceRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    fromUserIdAndServiceName(userId: string, serviceName: string): import("@prisma/client").Prisma.Prisma__UserServiceClient<{
        id: string;
        service_name: string;
        service_config: import("@prisma/client/runtime/library").JsonValue | null;
        errored: boolean;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(userId: string, serviceName: string): import("@prisma/client").Prisma.Prisma__UserServiceClient<{
        id: string;
        service_name: string;
        service_config: import("@prisma/client/runtime/library").JsonValue | null;
        errored: boolean;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    delete(id: string): import("@prisma/client").Prisma.Prisma__UserServiceClient<{
        id: string;
        service_name: string;
        service_config: import("@prisma/client/runtime/library").JsonValue | null;
        errored: boolean;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(args: {
        where: any;
        data: any;
    }): import("@prisma/client").Prisma.Prisma__UserServiceClient<{
        id: string;
        service_name: string;
        service_config: import("@prisma/client/runtime/library").JsonValue | null;
        errored: boolean;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
