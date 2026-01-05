import { ParameterDefinition, ParameterValue, ServiceConfig, ServiceReactionDefinition } from '@/common/service.types';
export declare class SendMessageToChannelReaction extends ServiceReactionDefinition {
    name: string;
    description: string;
    input_params: ParameterDefinition[];
    execute(sconf: ServiceConfig, params: Record<string, ParameterValue>): Promise<void>;
    reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>>;
}
