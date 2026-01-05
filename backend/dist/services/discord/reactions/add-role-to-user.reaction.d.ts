import { ParameterDefinition, ServiceConfig, ServiceReactionDefinition } from '@/common/service.types';
export declare class AddRoleToUserReaction extends ServiceReactionDefinition {
    name: string;
    description: string;
    input_params: ParameterDefinition[];
    execute(sconf: ServiceConfig, params: Record<string, any>): Promise<void>;
    reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>>;
}
