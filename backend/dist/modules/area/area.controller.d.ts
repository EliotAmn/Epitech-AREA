import type { Request } from 'express';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
export declare class AreaController {
    private readonly areaService;
    constructor(areaService: AreaService);
    create(req: Request & {
        user?: {
            sub?: string;
        };
    }, dto: CreateAreaDto): Promise<{
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    }>;
    findMyAreas(req: Request & {
        user?: {
            sub?: string;
        };
    }): Promise<({
        actions: {
            params: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            action_name: string;
            area_id: string;
            cache: import("@prisma/client/runtime/library").JsonValue;
        }[];
        reactions: {
            params: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            area_id: string;
            cache: import("@prisma/client/runtime/library").JsonValue;
            reaction_name: string;
        }[];
    } & {
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    })[]>;
    reloadArea(id: string): Promise<{
        ok: boolean;
    }>;
    deleteArea(req: Request & {
        user?: {
            sub?: string;
        };
    }, id: string): Promise<{
        ok: boolean;
    }>;
    updateParams(id: string, dto: {
        actions?: Array<{
            id: string;
            params?: Record<string, unknown>;
        }>;
        reactions?: Array<{
            id: string;
            params?: Record<string, unknown>;
        }>;
    }): Promise<({
        actions: {
            params: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            action_name: string;
            area_id: string;
            cache: import("@prisma/client/runtime/library").JsonValue;
        }[];
        reactions: {
            params: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            created_at: Date;
            updated_at: Date;
            area_id: string;
            cache: import("@prisma/client/runtime/library").JsonValue;
            reaction_name: string;
        }[];
    } & {
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
    }) | null>;
}
