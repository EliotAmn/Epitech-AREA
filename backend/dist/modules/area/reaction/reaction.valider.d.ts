import { ParameterValue, ServiceReactionDefinition } from '@/common/service.types';
export declare class ReactionValider {
    validate_reaction_params(reaction: ServiceReactionDefinition, input_params: Record<string, ParameterValue>): boolean;
}
