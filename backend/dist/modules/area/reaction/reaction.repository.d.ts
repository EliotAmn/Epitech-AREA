import { Prisma } from '@prisma/client';
import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class ReactionRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AreaReactionCreateArgs): Prisma.Prisma__AreaReactionClient<{
        id: string;
        created_at: Date;
        updated_at: Date;
        params: Prisma.JsonValue;
        area_id: string;
        cache: Prisma.JsonValue;
        reaction_name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        params: Prisma.JsonValue;
        area_id: string;
        cache: Prisma.JsonValue;
        reaction_name: string;
    }[]>;
    findById(id: string): Prisma.Prisma__AreaReactionClient<({
        area: {
            name: string;
            id: string;
            user_id: string;
            created_at: Date;
            updated_at: Date;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        params: Prisma.JsonValue;
        area_id: string;
        cache: Prisma.JsonValue;
        reaction_name: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, data: Prisma.AreaReactionUpdateInput): Prisma.Prisma__AreaReactionClient<{
        id: string;
        created_at: Date;
        updated_at: Date;
        params: Prisma.JsonValue;
        area_id: string;
        cache: Prisma.JsonValue;
        reaction_name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
}
