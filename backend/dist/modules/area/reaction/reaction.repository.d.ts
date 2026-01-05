import { Prisma } from '@prisma/client';
import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class ReactionRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AreaReactionCreateArgs): Prisma.Prisma__AreaReactionClient<{
        params: Prisma.JsonValue;
        id: string;
        created_at: Date;
        updated_at: Date;
        area_id: string;
        cache: Prisma.JsonValue;
        reaction_name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<{
        params: Prisma.JsonValue;
        id: string;
        created_at: Date;
        updated_at: Date;
        area_id: string;
        cache: Prisma.JsonValue;
        reaction_name: string;
    }[]>;
    findById(id: string): Prisma.Prisma__AreaReactionClient<({
        area: {
            id: string;
            user_id: string;
            created_at: Date;
            updated_at: Date;
            name: string;
        };
    } & {
        params: Prisma.JsonValue;
        id: string;
        created_at: Date;
        updated_at: Date;
        area_id: string;
        cache: Prisma.JsonValue;
        reaction_name: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, data: Prisma.AreaReactionUpdateInput): Prisma.Prisma__AreaReactionClient<{
        params: Prisma.JsonValue;
        id: string;
        created_at: Date;
        updated_at: Date;
        area_id: string;
        cache: Prisma.JsonValue;
        reaction_name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
}
