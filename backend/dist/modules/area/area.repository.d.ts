import { Prisma } from '@prisma/client';
import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class AreaRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AreaCreateArgs): Prisma.Prisma__AreaClient<{
        name: string;
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<({
        actions: {
            id: string;
            created_at: Date;
            updated_at: Date;
            params: Prisma.JsonValue;
            action_name: string;
            area_id: string;
            cache: Prisma.JsonValue;
        }[];
        reactions: {
            id: string;
            created_at: Date;
            updated_at: Date;
            params: Prisma.JsonValue;
            area_id: string;
            cache: Prisma.JsonValue;
            reaction_name: string;
        }[];
    } & {
        name: string;
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    })[]>;
    findByUserId(userId: string): Prisma.PrismaPromise<({
        actions: {
            id: string;
            created_at: Date;
            updated_at: Date;
            params: Prisma.JsonValue;
            action_name: string;
            area_id: string;
            cache: Prisma.JsonValue;
        }[];
        reactions: {
            id: string;
            created_at: Date;
            updated_at: Date;
            params: Prisma.JsonValue;
            area_id: string;
            cache: Prisma.JsonValue;
            reaction_name: string;
        }[];
    } & {
        name: string;
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    })[]>;
    findById(id: string): Prisma.Prisma__AreaClient<({
        actions: {
            id: string;
            created_at: Date;
            updated_at: Date;
            params: Prisma.JsonValue;
            action_name: string;
            area_id: string;
            cache: Prisma.JsonValue;
        }[];
        reactions: {
            id: string;
            created_at: Date;
            updated_at: Date;
            params: Prisma.JsonValue;
            area_id: string;
            cache: Prisma.JsonValue;
            reaction_name: string;
        }[];
    } & {
        name: string;
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, data: Prisma.AreaReactionUpdateInput): Prisma.Prisma__AreaClient<{
        name: string;
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    delete(id: string): Prisma.Prisma__AreaClient<{
        name: string;
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
}
