import { UserService } from '@prisma/client';
export declare enum ParameterType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    SELECT = "select"
}
export interface ParameterValue {
    type: ParameterType;
    value: any;
}
export interface ParameterDefinition {
    name: string;
    type: ParameterType;
    label: string;
    description: string;
    required: boolean;
    options?: {
        label: string;
        value: string;
    }[];
}
export interface ServiceConfig {
    config: Record<string, unknown>;
    cache?: Record<string, unknown>;
}
export interface ActionTriggerOutput {
    triggered: boolean;
    parameters: Record<string, ParameterValue>;
    cache?: Record<string, unknown>;
}
export declare abstract class ServiceActionDefinition {
    name: string;
    label: string;
    description: string;
    poll_interval: number;
    output_params: ParameterDefinition[];
    input_params?: ParameterDefinition[];
    abstract reload_cache(sconf: ServiceConfig): Promise<Record<string, any>>;
    abstract poll(sconf: ServiceConfig): Promise<ActionTriggerOutput>;
}
export declare abstract class ServiceReactionDefinition {
    name: string;
    label: string;
    description: string;
    input_params: ParameterDefinition[];
    abstract execute(sconf: ServiceConfig, params: Record<string, ParameterValue>): Promise<void>;
    abstract reload_cache(sconf?: ServiceConfig): Promise<Record<string, any>>;
}
export type ServiceActionConstructor = new (...args: any[]) => ServiceActionDefinition;
export type ServiceReactionConstructor = new (...args: any[]) => ServiceReactionDefinition;
export interface ServiceDefinition {
    name: string;
    label: string;
    description: string;
    oauth_url?: string;
    oauth_callback?: (userService: UserService, params: {
        [key: string]: string;
    }) => Promise<boolean>;
    mandatory_env_vars?: string[];
    actions: Array<ServiceActionConstructor>;
    reactions: Array<ServiceReactionConstructor>;
}
