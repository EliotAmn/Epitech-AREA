
export enum ParamaterType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    SELECT = "select",
}

export interface ParameterValue {
    type: ParamaterType;
    value: any;
}

export interface ParameterDefinition {
    name: string;
    type: ParamaterType;
    label: string;
    description: string;
    required: boolean;
    options?: string[]; // For SELECT type
}

interface ServiceConfig {
    config: Record<string, any>;
}

export class ServiceActionDefinition {
    name: string;
    description: string;
    output_params: ParameterDefinition[];

    // Function to reload the cache of the action in a user-area context
    reload_cache: (sconf: ServiceConfig) => Promise<Record<string, any>>;

    poll: (sconf: ServiceConfig) => Promise<{triggered: boolean, parameters: Record<string, ParameterValue>}>;

}

export class ServiceReactionDefinition {
    name: string;
    description: string;
    input_params: ParameterDefinition[];

    // sconf: Service config, params: parameters/context given from the area (not the action params definition)
    execute: (sconf: ServiceConfig, params: Record<string, any>) => Promise<void>;
}


export interface ServiceDefinition {
    name: string;
    label: string;
    description: string;
    actions: ServiceActionDefinition[];
    reactions: ServiceReactionDefinition[];
}
