import { Prisma } from '@prisma/client';
import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class AreaRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AreaCreateArgs): Prisma.Prisma__AreaClient<{
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<({
        actions: {
            params: Prisma.JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            action_name: string;
            area_id: string;
            cache: Prisma.JsonValue;
        }[];
        reactions: {
            params: Prisma.JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            area_id: string;
            cache: Prisma.JsonValue;
            reaction_name: string;
        }[];
    } & {
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    })[]>;
    findByUserId(userId: string): Prisma.PrismaPromise<({
        actions: {
            params: Prisma.JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            action_name: string;
            area_id: string;
            cache: Prisma.JsonValue;
        }[];
        reactions: {
            params: Prisma.JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            area_id: string;
            cache: Prisma.JsonValue;
            reaction_name: string;
        }[];
    } & {
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    })[]>;
    findById(id: string): Prisma.Prisma__AreaClient<({
        actions: {
            params: Prisma.JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            action_name: string;
            area_id: string;
            cache: Prisma.JsonValue;
        }[];
        reactions: {
            params: Prisma.JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            area_id: string;
            cache: Prisma.JsonValue;
            reaction_name: string;
        }[];
    } & {
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, data: Prisma.AreaReactionUpdateInput): Prisma.Prisma__AreaClient<{
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    delete(id: string): Prisma.Prisma__AreaClient<{
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
}
