import { ServiceActionDefinition } from '@/common/service.types';
import type { ActionTriggerOutput, ParameterDefinition, ServiceConfig } from '@/common/service.types';
export declare class MessageContainsKeywordAction extends ServiceActionDefinition {
    name: string;
    label: string;
    description: string;
    output_params: ParameterDefinition[];
    input_params: ParameterDefinition[];
    private lastMessageId;
    private triggeredOutput;
    reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>>;
    poll(_sconf: ServiceConfig): Promise<ActionTriggerOutput>;
}
