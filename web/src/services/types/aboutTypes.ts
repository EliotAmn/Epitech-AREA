import type { ParameterDefinition } from "@/component/ConfigWidget";

export type ServiceActionReaction = {
    name: string;
    description: string;
    input_params?: ParameterDefinition[];
    output_params?: ParameterDefinition[];
};

export type ServiceDefinition = {
    name: string;
    actions: ServiceActionReaction[];
    reactions: ServiceActionReaction[];
};

export type AboutData = {
    client?: { host: string };
    server?: {
        current_time?: number;
        services: ServiceDefinition[];
    };
};
