import { ServiceActionDefinition } from '@/common/service.types';
import type { ActionTriggerOutput, ParameterDefinition, ServiceConfig } from '@/common/service.types';
export declare class PlayingStateUpdated extends ServiceActionDefinition {
    name: string;
    label: string;
    description: string;
    poll_interval: number;
    output_params: ParameterDefinition[];
    input_params: ParameterDefinition[];
    reload_cache(): Promise<Record<string, unknown>>;
    poll(sconf: ServiceConfig): Promise<ActionTriggerOutput>;
}
