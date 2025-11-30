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

export interface ServiceConfig<C = Record<string, any>> {
    config: C;
}

// Action definition is now generic over the service config type `C`.
export class ServiceActionDefinition<C = Record<string, any>> {
    name: string;
    description: string;
    output_params: ParameterDefinition[];

    // Function to reload the cache of the action in a user-area context
    reload_cache: (sconf: ServiceConfig<C>) => Promise<Record<string, any> >;

    poll: (sconf: ServiceConfig<C>) => Promise<{ triggered: boolean, parameters: Record<string, ParameterValue> } >;

}

export class ServiceReactionDefinition<C = Record<string, any>> {
    name: string;
    description: string;
    input_params: ParameterDefinition[];

    // sconf: Service config, params: parameters/context given from the area (not the action params definition)
    execute: (sconf: ServiceConfig<C>, params: Record<string, any>) => Promise<void>;
}

export interface ServiceDefinition<C = Record<string, any>> {
    name: string;
    label: string;
    description: string;
    actions: ServiceActionDefinition<C>[];
    reactions: ServiceReactionDefinition<C>[];
}
