import { ActionTriggerOutput, ParameterDefinition, ServiceActionDefinition, ServiceConfig } from '@/common/service.types';
export declare class NewMessageInChannelAction extends ServiceActionDefinition {
    name: string;
    label: string;
    description: string;
    output_params: ParameterDefinition[];
    input_params: ParameterDefinition[];
    private lastMessageId;
    private triggeredOutput;
    reload_cache(sconf: ServiceConfig): Promise<Record<string, any>>;
    poll(_sconf: ServiceConfig): Promise<ActionTriggerOutput>;
}
