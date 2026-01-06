import { Prisma } from '@prisma/client';
import { ActionTriggerOutput } from '@/common/service.types';
import { ServiceImporterService } from '@/modules/service_importer/service_importer.service';
import { UserServiceService } from '@/modules/user_service/userservice.service';
import { ActionRepository } from './action/action.repository';
import { AreaRepository } from './area.repository';
import { ReactionRepository } from './reaction/reaction.repository';
import { ReactionValider } from './reaction/reaction.valider';
export declare class AreaService {
    private readonly action_repository;
    private readonly area_repository;
    private readonly reaction_repository;
    private readonly reaction_valider;
    private readonly service_importer_service;
    private readonly userservice_service;
    private actionPollers;
    private actionInstances;
    constructor(action_repository: ActionRepository, area_repository: AreaRepository, reaction_repository: ReactionRepository, reaction_valider: ReactionValider, service_importer_service: ServiceImporterService, userservice_service: UserServiceService);
    handle_action_trigger(action_id: string, action_out: ActionTriggerOutput): Promise<void>;
    private stopAreaPollers;
    private initActionsForArea;
    private initReactionsForArea;
    create(userId: string, dto: {
        name: string;
        actions: Array<{
            action_name: string;
            params?: Record<string, unknown>;
        }>;
        reactions: Array<{
            reaction_name: string;
            params?: Record<string, unknown>;
        }>;
    }): Promise<{
        name: string;
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }>;
    findByUser(userId: string): Promise<({
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
    initializeAll(): Promise<void>;
    initializeOne(areaId: string): Promise<void>;
    updateParams(areaId: string, dto: {
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
    }) | null>;
    deleteArea(areaId: string, userId?: string): Promise<{
        ok: boolean;
    }>;
}
