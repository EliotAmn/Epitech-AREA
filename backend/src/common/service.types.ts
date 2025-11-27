export interface UserAction {

}

export interface ServiceAction {
    name: string;
    description: string;
    parameters: Record<string, any>;
}

export interface ServiceReaction {
    name: string;
    description: string;
    parameters: Record<string, any>;
}

export interface ServiceDefinition {
    name: string;
    label: string;
    description: string;
    actions: ServiceAction[];
    reactions: ServiceReaction[];
}
