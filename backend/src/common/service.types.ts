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

export abstract class ServiceActionDefinition<C = Record<string, any>> {
    name: string;
    description: string;
    output_params: ParameterDefinition[];

    // Function to reload the cache of the action in a user-area context
    abstract reload_cache(sconf: ServiceConfig<C>): Promise<Record<string, any> >;

    abstract poll(sconf: ServiceConfig<C>): Promise<{ triggered: boolean, parameters: Record<string, ParameterValue> } >;

}

export abstract class ServiceReactionDefinition<C = Record<string, any>> {
    name: string;
    description: string;
    input_params: ParameterDefinition[];

    // sconf: Service config, params: parameters/context given from the area (not the action params definition)
    abstract execute(sconf: ServiceConfig<C>, params: Record<string, any>): Promise<void>;
}

// Constructor types for providing classes (subclasses) instead of instances.
export type ServiceActionConstructor<C = Record<string, any>> = new (...args: any[]) => ServiceActionDefinition<C>;
export type ServiceReactionConstructor<C = Record<string, any>> = new (...args: any[]) => ServiceReactionDefinition<C>;

export interface ServiceDefinition<C = Record<string, any>> {
    name: string;
    label: string;
    description: string;
    // Accept either instances or class constructors (subclasses) for flexibility.
    actions: Array<ServiceActionDefinition<C> | ServiceActionConstructor<C>>;
    reactions: Array<ServiceReactionDefinition<C> | ServiceReactionConstructor<C>>;
}
