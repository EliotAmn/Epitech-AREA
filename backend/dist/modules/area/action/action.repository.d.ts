import { Prisma } from '@prisma/client';
import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class ActionRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AreaActionCreateArgs): Prisma.Prisma__AreaActionClient<{
        params: Prisma.JsonValue;
        id: string;
        created_at: Date;
        updated_at: Date;
        action_name: string;
        area_id: string;
        cache: Prisma.JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<{
        params: Prisma.JsonValue;
        id: string;
        created_at: Date;
        updated_at: Date;
        action_name: string;
        area_id: string;
        cache: Prisma.JsonValue;
    }[]>;
    findById(id: string): Prisma.Prisma__AreaActionClient<{
        params: Prisma.JsonValue;
        id: string;
        created_at: Date;
        updated_at: Date;
        action_name: string;
        area_id: string;
        cache: Prisma.JsonValue;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, data: Prisma.AreaActionUpdateInput): Prisma.Prisma__AreaActionClient<{
        params: Prisma.JsonValue;
        id: string;
        created_at: Date;
        updated_at: Date;
        action_name: string;
        area_id: string;
        cache: Prisma.JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
}
