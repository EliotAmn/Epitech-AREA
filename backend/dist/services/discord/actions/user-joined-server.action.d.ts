import { ActionTriggerOutput, ParameterDefinition, ServiceActionDefinition, ServiceConfig } from '@/common/service.types';
export declare class UserJoinedServerAction extends ServiceActionDefinition {
    name: string;
    label: string;
    description: string;
    output_params: ParameterDefinition[];
    input_params: ParameterDefinition[];
    private triggeredOutput;
    reload_cache(sconf: ServiceConfig): Promise<{
        guild_id: string;
        handler_id: string;
    }>;
    poll(_sconf: ServiceConfig): Promise<ActionTriggerOutput>;
}
