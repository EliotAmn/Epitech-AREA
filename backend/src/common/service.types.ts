export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
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
  options?: string[]; // For SELECT type
}

export interface ServiceConfig {
  config: Record<string, any>;
}

export interface ActionTriggerOutput {
  triggered: boolean;
  parameters: Record<string, ParameterValue>;
}

export abstract class ServiceActionDefinition {
  name: string;
  label: string;
  description: string;
  output_params: ParameterDefinition[];
  input_params?: ParameterDefinition[];

  abstract reload_cache(sconf: ServiceConfig): Promise<Record<string, any>>;

  abstract poll(sconf: ServiceConfig): Promise<ActionTriggerOutput>;
}

export abstract class ServiceReactionDefinition {
  name: string;
  label: string;
  description: string;
  input_params: ParameterDefinition[];

  abstract execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void>;

  abstract reload_cache(sconf?: ServiceConfig): Promise<Record<string, any>>;
}

export type ServiceActionConstructor = new (
  ...args: any[]
) => ServiceActionDefinition;
export type ServiceReactionConstructor = new (
  ...args: any[]
) => ServiceReactionDefinition;

export interface ServiceDefinition {
  name: string;
  label: string;
  description: string;
  actions: Array<ServiceActionConstructor>;
  reactions: Array<ServiceReactionConstructor>;
}
